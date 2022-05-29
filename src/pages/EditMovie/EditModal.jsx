import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import {
  collection,
  doc,
  runTransaction,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { uploadBytes, ref, deleteObject } from "firebase/storage";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../../firebaseConfig";
import DescriptionForm from "../AddingMovie/DescriptionForm";
import InformationForm from "../AddingMovie/InformationForm";
import UploadingImg from "../AddingMovie/UploadingImg";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import { toastConfig } from "../../../toastConfig";
import Toast from "../../../components/Toast/Toast";
const tabs = [
  {
    label: "Sửa thông tin",
    id: "information",
  },
  {
    label: "Sửa mô tả",
    id: "description",
  },
  {
    label: "Sửa ảnh bìa",
    id: "posterImg",
  },
  {
    label: "Sửa ảnh trailer",
    id: "coverImg",
  },
];

const uploadImage = async (img, ref) => {
  if (!(img instanceof Blob)) return;
  const compressedFile = await imageCompression(img, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    fileType: "image/png",
  });
  await uploadBytes(ref, compressedFile);
};

const EditModal = ({ onSuccessUpdate, onClose, movieId }) => {
  const movieRef = doc(db, "movies", movieId);
  const data = useFirestoreDocumentData(["movies", movieId], movieRef);
  const ratingRef = data.data?.ratingRef;
  const ratingData = useFirestoreDocumentData(
    ["ratings", movieId],
    ratingRef,
    {},
    {
      enabled: !!data.data?.ratingRef,
    }
  );
  const movieData = {
    ...data.data,
    ...ratingData.data,
  };
  console.log(movieData);

  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const { register, handleSubmit } = useForm();
  const [status, setStatus] = useState();
  const [img, setImg] = useState();
  const [coverImg, setCoverImg] = useState();
  const handleChangeTab = (tab) => {
    if (data.isLoading) return;
    setCurrentTab(tab);
  };

  const onSubmit = async (newData) => {
    if (status) return;
    try {
      const oldData = data.data;
      if (!oldData) return;
      if (img) setStatus("Đang tải lên ảnh...");

      await uploadImage(img, ref(storage, `posters/${oldData.urlId}.png`));
      await uploadImage(
        coverImg,
        ref(storage, `covers/${oldData.urlId}-cover.png`)
      );
      const { rating, votes, ...movieData } = newData;
      setStatus("Đang tải lên dữ liệu...");
      await runTransaction(db, async (transaction) => {
        transaction.update(movieRef, {
          ...movieData,
          duration: parseInt(movieData.duration),
        });
        transaction.update(oldData.ratingRef, {
          rating,
          votes,
        });
      });
      setStatus("Cập nhật thành công");
      toast.success("Sửa thông tin thành công", toastConfig);
      onSuccessUpdate(newData.status);
      data.refetch();
      ratingData.refetch();
      onClose();
    } catch (e) {
      console.log(e);
      toast.error("Sửa thông tin thất bại", toastConfig);
    } finally {
      setStatus(undefined);
    }
  };

  return (
    <>
      <Toast />

      <div className="modal modal-open">
        <div className="modal-box relative h-[600px] max-w-[65%] items-start bg-slate-100 flex flex-col">
          <label
            onClick={onClose}
            className="btn btn-sm btn-circle absolute right-2 top-2"
          >
            ✕
          </label>
          <ul className="tabs tabs-boxed w-max">
            {tabs.map((tab, index) => (
              <li
                key={index}
                className={`tab ${
                  currentTab.id === tab.id ? "tab-active" : ""
                }`}
                onClick={() => handleChangeTab(tab)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
          <div className="w-full flex-1 overflow-y-auto">
            {currentTab.id === "information" && (
              <InformationForm
                register={register}
                data={movieData}
                isLoading={data.isLoading}
              />
            )}
            {currentTab.id === "description" && (
              <DescriptionForm
                register={register}
                description={data.data.description || ""}
              />
            )}
            {currentTab.id === "posterImg" && (
              <form className="w-full h-full flex flex-col justify-center items-center gap-4">
                <h1 className="text-2xl font-bold">Chọn ảnh bìa mới</h1>
                <UploadingImg onSetImg={setImg} img={img} />
              </form>
            )}
            {currentTab.id === "coverImg" && (
              <form className="w-full h-full flex flex-col justify-center items-center gap-4">
                <h1 className="text-2xl font-bold">Chọn ảnh cover mới</h1>
                <UploadingImg onSetImg={setCoverImg} img={coverImg} />
              </form>
            )}
          </div>
          <div className="w-full mt-6 flex justify-end">
            <button
              onClick={handleSubmit(onSubmit)}
              className={`btn ${status ? "loading" : ""}`}
            >
              {status ? status : "Xác nhận thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditModal;
