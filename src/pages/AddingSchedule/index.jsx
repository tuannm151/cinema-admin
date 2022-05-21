import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { collection, query, where } from "firebase/firestore";
import React from "react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Toast from "../../../components/Toast/Toast";
import { db } from "../../../firebaseConfig";
import { toastConfig } from "../../../toastConfig";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useForm } from "react-hook-form";

const tabs = [
  {
    label: "Chọn rạp phim",
    id: "chooseCinema",
  },
  {
    label: "Chọn phim và lịch chiếu",
    id: "setSchedule",
  },
];
const AddingSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();

  const [status, setStatus] = useState();
  const [region, setRegion] = useState();
  const [cinemaId, setCinemaId] = useState();

  const moviesQuery = useFirestoreQuery(
    ["movies"],
    query(collection(db, "movies")),
    {
      subscribe: true,
    }
  );

  const moviesSnaphot = moviesQuery.data;
  const docDatas = moviesSnaphot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  const ref = query(
    collection(db, "cinemas"),
    where("region", "==", region || "")
  );
  const cinemasQuery = useFirestoreQuery(
    ["cinemas", region],
    ref,
    {},
    {
      enabled: !!region,
    }
  );
  const onChangeCinema = () => {
    setCinemaId(watch("cinema"));
  };
  const snapshot = cinemasQuery.data;
  const cinemas = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  useEffect(() => {
    console.log(cinemaId);
    if (!cinemas || cinemaId) return;
    setCinemaId(cinemas[0].id);
  }, [cinemas]);

  const cinemaOptions =
    cinemas?.length > 0
      ? cinemas.map((cinema) => ({
          label: cinema.name,
          value: cinema.id,
        }))
      : [
          {
            label: "Chọn khu vực trước",
            value: "",
          },
        ];

  console.log(cinemas);
  console.log(docDatas);
  const movieOptions = docDatas?.map((doc) => ({
    label: doc.title,
    value: doc.id,
  })) || [
    {
      label: "Chọn phim",
      value: "",
    },
  ];

  console.log(cinemaId);
  const cinemaData = cinemas?.find((cinema) => cinema.id === cinemaId);
  console.log(cinemaData);
  const roomOptions = cinemaData
    ? cinemaData?.rooms?.map((room) => ({
        label: room?.name,
        value: room?.name,
      }))
    : [
        {
          label: "Chọn rạp chiếu trước",
          value: "",
        },
      ];
  const onSubmit = async (newData) => {
    try {
      setStatus("Tải lên dữ liệu");

      setStatus("Tải lên thành công");
      toast.success("Thêm phòng chiếu thành công", toastConfig);
    } catch (err) {
      console.log(err);
      toast.error("Có lỗi xảy ra", toastConfig);
    } finally {
      setTimeout(() => {
        reset();
        setStatus(undefined);
        setRegion(undefined);
      }, 3000);
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
              <h1 className="font-bold mt-14 text-3xl">Thêm lịch chiếu mói</h1>
              <p className="text-stone-500 text-xl">
                Nhập thông tin lịch chiếu{" "}
              </p>
              <div className="w-3/4 flex flex-col rounded-xl px-4 py-8 mt-10">
                <form className="grid grid-cols-2 justify-items-center gap-4 mt-10 flex-1">
                  <Select
                    name="region"
                    label="Chọn khu vực"
                    register={register}
                    disableDefault={true}
                    options={[
                      {
                        label: "Chọn khu vực",
                        value: "",
                      },
                      {
                        label: "Hà Nội",
                        value: "hanoi",
                      },
                      {
                        label: "Quảng Ninh",
                        value: "quangninh",
                      },
                    ]}
                    onChange={(e) => setRegion(e.target?.value || undefined)}
                  />
                  <Select
                    name="cinema"
                    label="Chọn rạp"
                    register={register}
                    disableDefault={false}
                    options={cinemaOptions}
                    onChange={(e) =>
                      onChangeCinema(e.target?.value || undefined)
                    }
                  />
                  <Select
                    name="room"
                    label="Chọn phòng chiếu"
                    register={register}
                    disableDefault={false}
                    options={roomOptions}
                  />
                  <Select
                    name="movie"
                    label="Chọn phim"
                    register={register}
                    disableDefault={false}
                    options={movieOptions}
                  />
                  <Input
                    name="date"
                    label="Ngày chiếu"
                    register={register}
                    disableDefault={false}
                    type="date"
                  />
                  <Input
                    name="time"
                    label="Giờ chiếu"
                    register={register}
                    disableDefault={false}
                    type="time"
                  />
                </form>
                <div className="self-end mt-4 flex gap-4">
                  <button
                    onClick={handleSubmit(onSubmit)}
                    className={`btn ${status ? "loading" : ""}`}
                  >
                    {status ? status : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AddingSchedule;
