import React, { useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useForm } from "react-hook-form";
import InformationForm from "./InformationForm";
import DescriptionForm from "./DescriptionForm";
import UploadingImg from "./UploadingImg";
import imageCompression from "browser-image-compression";
import { doc, collection, addDoc, runTransaction } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebaseConfig";
import { toast } from "react-toastify";
import { toastConfig } from "../../../toastConfig";
import Toast from "../../../components/Toast/Toast";

const tabs = [
  {
    label: "Thêm thông tin",
    id: "information",
  },
  {
    label: "Thêm mô tả",
    id: "description",
  },
  {
    label: "Thêm ảnh bìa",
    id: "posterImg",
  },
  {
    label: "Thêm ảnh cover",
    id: "coverImg",
  },
];

const moviesRef = collection(db, "movies");
const ratingsRef = collection(db, "ratings");

const AddingMovie = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const { register, handleSubmit, reset } = useForm();
  const [data, setData] = useState({});
  const [status, setStatus] = useState();
  const [img, setImg] = useState();
  const [coverImg, setCoverImg] = useState();

  const resetState = () => {
    setData({});
    setImg();
    setCoverImg();
    setStatus();
    setTabIndex(0);
    reset();
  };
  const handleToPrev = () => {
    if (tabIndex === 0) return;
    setTabIndex((prev) => prev - 1);
  };
  const uploadData = async () => {
    if (status) return;
    try {
      if (!img) return;
      const compressedFile = await imageCompression(img, {
        maxSizeMB: 1.5,
        alwaysKeepResolution: true,
        fileType: "image/png",
      });
      const coverImgCompressed = imageCompression(coverImg, {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        fileType: "image/png",
      });
      const imgRef = ref(storage, `posters/${data.urlId}.png`);
      const coverRef = ref(storage, `covers/${data.urlId}-cover.png`);

      setStatus("Tải lên ảnh...");
      await uploadBytes(imgRef, compressedFile);
      await uploadBytes(coverRef, coverImgCompressed);

      setStatus("Tải lên dữ liệu...");
      const imageUrl = await getDownloadURL(imgRef);
      const coverUrl = await getDownloadURL(coverRef);

      const { rating, votes, ...movieData } = data;

      await runTransaction(db, async (transaction) => {
        const ratingRef = doc(ratingsRef);
        const movieRef = doc(moviesRef);
        transaction.set(ratingRef, {
          rating,
          votes,
          movieRef,
        });
        transaction.set(movieRef, {
          ...movieData,
          imageUrl,
          coverUrl,
          ratingRef,
          duration: parseInt(movieData.duration),
        });
      });

      toast.success("Thêm thông tin phim thành cồng", toastConfig);
    } catch (err) {
      console.log(err);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại", toastConfig);
    } finally {
      setStatus(undefined);
      resetState();
    }
  };
  const handleToNext = (newData) => {
    if (tabs[tabIndex].id === "coverImg") {
      uploadData();
    } else {
      setData({ ...data, ...newData });
      setTabIndex((prev) => prev + 1);
    }
  };

  return (
    <>
      <Toast />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/*  Site header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main>
            <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <h1 className="font-bold mt-14 text-3xl">Thêm phim mới</h1>
              <p className="text-stone-500 text-xl">Nhập thông tin về phim </p>
              <div className="w-3/4 flex flex-col rounded-xl px-4 py-8 mt-10">
                <ul className="steps self-center">
                  {tabs.map((tab, index) => (
                    <li
                      className={`step ${
                        tabIndex >= index ? "step-primary" : ""
                      }`}
                      key={index}
                    >
                      {tab.label}
                    </li>
                  ))}
                </ul>
                {tabs[tabIndex].id === "information" && (
                  <InformationForm register={register} data={data} />
                )}
                {tabs[tabIndex].id === "description" && (
                  <DescriptionForm
                    register={register}
                    description={data.description || ""}
                  />
                )}
                {tabs[tabIndex].id === "posterImg" && (
                  <form className="w-full flex flex-col items-center my-6">
                    <UploadingImg onSetImg={setImg} img={img} />
                  </form>
                )}

                {tabs[tabIndex].id === "coverImg" && (
                  <form className="w-full flex flex-col items-center my-6">
                    <UploadingImg onSetImg={setCoverImg} img={coverImg} />
                  </form>
                )}
                <div className="self-end mt-4 flex gap-4">
                  {tabIndex > 0 && (
                    <button onClick={handleToPrev} className="btn">
                      Back
                    </button>
                  )}
                  {tabIndex < tabs.length && (
                    <button
                      onClick={handleSubmit(handleToNext)}
                      className={`btn ${status ? "loading" : ""}`}
                    >
                      {status
                        ? status
                        : tabs[tabIndex].id === "coverImg"
                        ? "Confirm"
                        : "Next"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AddingMovie;
