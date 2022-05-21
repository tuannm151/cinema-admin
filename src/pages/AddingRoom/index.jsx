import { useFirestoreQuery } from "@react-query-firebase/firestore";
import {
  addDoc,
  collection,
  doc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Toast from "../../../components/Toast/Toast";
import { db } from "../../../firebaseConfig";
import { toastConfig } from "../../../toastConfig";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";

const generateSeatData = (maxColumn, maxRow) => {
  const seatData = [];
  for (let i = 0; i < maxRow; i++) {
    const rowId = String.fromCharCode(65 + i);
    for (let j = 1; j <= maxColumn; j++) {
      const seat = {
        type:
          j === maxColumn
            ? { name: "Couple", id: "couple", price: 200 }
            : { name: "Standard", id: "standard", price: 80 },
        status: "AVAILABLE",
        id: `${rowId}${j}`,
      };
      seatData.push(seat);
    }
  }
  return seatData;
};

const seatData = generateSeatData(12, 12);

const AddingRoom = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [status, setStatus] = useState();
  const [region, setRegion] = useState();
  
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
  const snapshot = cinemasQuery.data;
  const cinemas = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  const onSubmit = async (newData) => {
    try {
      setStatus("Tải lên dữ liệu");
      const cinema = cinemas.find((cinema) => cinema.id === newData.cinema);
      await setDoc(
        doc(db, "cinemas", newData.cinema),
        {
          rooms: [
            ...cinema.rooms,
            {
              name: newData.name,
              rowSize: newData.rowSize,
              seatData,
            },
          ],
        },
        {
          merge: true,
        }
      );
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
              <h1 className="font-bold mt-14 text-3xl">Thêm phòng chiếu</h1>
              <p className="text-stone-500 text-xl">
                Nhập thông tin phòng chiếu{" "}
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
                    onChange={(e) => setRegion(e.target?.value || undefined)}
                  />
                  <Select
                    name="cinema"
                    label="Chọn rạp"
                    register={register}
                    disableDefault={false}
                    options={cinemaOptions}
                  />
                  <Input
                    name="name"
                    label="Tên phòng chiếu"
                    register={register}
                    required={true}
                    placeholder="Nhập tên phòng chiếu"
                  />
                  <Input
                    name="rowSize"
                    label="Số ghế trên một hàng"
                    register={register}
                    required={true}
                    type="number"
                    placeholder="Nhập số ghế tối đa trên một hàng"
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

export default AddingRoom;
