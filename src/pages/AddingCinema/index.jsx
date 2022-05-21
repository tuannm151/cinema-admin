import { addDoc, collection } from "firebase/firestore";
import React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Toast from "../../../components/Toast/Toast";
import { db } from "../../../firebaseConfig";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { toast } from "react-toastify";
import { toastConfig } from "../../../toastConfig";
const AddingCinema = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [status, setStatus] = useState();

  const onSubmit = async (newData) => {
    try {
      setStatus("Tải lên dữ liệu");
      await addDoc(collection(db, "cinemas"), {
        ...newData,
        rooms: [],
      });
      setStatus("Tải lên thành công");
      toast.success("Thêm rạp phim thành công", toastConfig);
    } catch (err) {
      console.log(err);
      toast.error("Có lỗi xảy ra", toastConfig);
    } finally {
      setTimeout(() => {
        reset();
        setStatus(undefined);
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
              <h1 className="font-bold mt-14 text-3xl">Thêm rạp chiếu mới</h1>
              <p className="text-stone-500 text-xl">
                Nhập thông tin rạp chiếu{" "}
              </p>
              <div className="w-3/4 flex flex-col rounded-xl px-4 py-8 mt-10">
                <form
                  className="grid grid-cols-2 justify-items-center gap-4 mt-10 flex-1"
                  onSubmit={handleSubmit(onSubmit)}
                >
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
                  />
                  <Input
                    name="name"
                    label="Tên rạp chiếu"
                    register={register}
                    required={true}
                    placeholder="Nhập tên rạp chiếu"
                  />
                  <Input
                    name="address"
                    label="Địa chỉ"
                    register={register}
                    required={true}
                    placeholder="Nhập địa chỉ"
                  />
                  <Input
                    name="location"
                    label="Vị trí"
                    register={register}
                    required={true}
                    placeholder="Nhập toạ độ (latitude,longitude)"
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

export default AddingCinema;
