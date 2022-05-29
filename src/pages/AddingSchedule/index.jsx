import { useFirestoreQuery } from "@react-query-firebase/firestore";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useMemo } from "react";
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
import { parseISOLocal, timeStampToTimeString } from "../../utils/timeConvert";

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
  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const [status, setStatus] = useState();
  const [region, setRegion] = useState();
  const [cinemaId, setCinemaId] = useState();
  const [movieId, setMovieId] = useState();

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
  const snapshot = cinemasQuery.data;
  const cinemas = snapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));

  const showTypesQuery = useFirestoreQuery(
    ["showType"],
    collection(db, "showTypes")
  );

  const showTypesSnapshot = showTypesQuery.data;
  const showTypes = showTypesSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }));
  useEffect(() => {
    if (!cinemas || cinemaId) return;
    setCinemaId(cinemas[0].id);
    setValue("cinemaId", cinemas[0].id);
    setValue("room", cinemas[0].rooms[0].name);
  }, [cinemasQuery]);

  useEffect(() => {
    if (!showTypes) return;
    setValue("showType", showTypes[0].name);
  }, [showTypesQuery]);

  useEffect(() => {
    if (!docDatas) return;
    setValue("movieId", docDatas[0].id);
  }, [moviesQuery]);

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

  const movieOptions = useMemo(() => {
    return (
      docDatas?.map((doc) => ({
        label: doc.title,
        value: doc.id,
      })) || [
        {
          label: "Chọn phim",
          value: "",
        },
      ]
    );
  }, [moviesQuery]);

  const showTypeOptions = useMemo(() => {
    return (
      showTypes?.map((showType) => ({
        label: showType.name,
        value: showType.name,
      })) || [
        {
          label: "Chọn loại show",
          value: "",
        },
      ]
    );
  }, [showTypesQuery]);

  const cinemaData = cinemas?.find((cinema) => cinema.id === cinemaId);
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
      console.log(newData);
      // cinema: "Md4ltDZ7uzWg6QMIbbBc";
      // date: "2022-05-25";
      // movie: "7MQlvLGX0L4pF6KlcQ5S";
      // region: "hanoi";
      // room: "Cinema 05";
      // showType: "IMAX 2D";
      // time: "20:05";
      // parse timestamp to UTC
      const {
        cinemaId,
        date,
        time,
        movieId,
        region,
        room: roomName,
        showType,
      } = newData;
      const movieDuration = docDatas?.find(
        (movie) => movie.id === movieId
      )?.duration;

      const dateTimestamp = parseISOLocal(date + "T00:00:00").getTime();
      const timeTimestamp = parseISOLocal(date + "T" + time + ":00").getTime();
      const delayTime = 5;
      const endTimestamp =
        timeTimestamp + (parseInt(movieDuration) + delayTime) * 60 * 1000;

      if (!dateTimestamp || !timeTimestamp) {
        throw new Error("Sai dữ liệu");
      }
      const schedulesQuery = query(
        collection(db, "schedules"),
        where("movieId", "==", movieId),
        where("region", "==", region),
        where("timestamp", "==", dateTimestamp)
      );
      const hourSchedulesQuery = query(
        collection(db, "schedulesByRoom"),
        where("cinemaId", "==", cinemaId),
        where("room", "==", roomName),
        where("endTimestamp", ">=", timeTimestamp)
      );

      const schedulesSnapshot = await getDocs(schedulesQuery);

      const scheduleDoc = schedulesSnapshot.docs?.[0];
      const hourSchedulesSnapshot = await getDocs(hourSchedulesQuery);

      await runTransaction(db, async (transaction) => {
        const cinemaDoc = await transaction.get(doc(db, "cinemas", cinemaId));
        if (hourSchedulesSnapshot.docs.length > 0) {
          for (const hourSchedule of hourSchedulesSnapshot.docs) {
            const hourScheduleData = hourSchedule.data();
            const { startTimestamp: start, endTimestamp: end } =
              hourScheduleData;
            if (start <= endTimestamp) {
              throw new Error(
                `Khung thời gian đã tồn tại ${timeStampToTimeString(
                  start
                )} - ${timeStampToTimeString(end)}`
              );
            }
          }
        }
        transaction.set(doc(collection(db, "schedulesByRoom")), {
          cinemaId,
          movieId,
          room: roomName,
          startTimestamp: timeTimestamp,
          endTimestamp: endTimestamp,
        });

        const cinemaData = cinemaDoc.data();
        const roomBootstrap = cinemaData.rooms.find(
          (room) => room.name === roomName
        );

        const roomShiftRef = doc(collection(db, "roomShift"));
        transaction.set(roomShiftRef, roomBootstrap);

        const newHourSchedule = {
          showType: showType,
          startTimestamp: timeTimestamp,
          endTimestamp,
          room: roomName,
          roomShiftPath: roomShiftRef.path,
        };

        const newCinemaSchedule = {
          id: cinemaId,
          name: cinemaData.name,
          hourSchedules: [newHourSchedule],
        };

        const newDailySchedule = {
          movieId,
          timestamp: dateTimestamp,
          region,
          cinemaSchedules: [newCinemaSchedule],
        };

        if (!scheduleDoc?.exists()) {
          transaction.set(doc(collection(db, "schedules")), newDailySchedule);
          return;
        }

        const scheduleData = scheduleDoc.data();

        const { cinemaSchedules } = scheduleData;
        const cinemaSchedule = cinemaSchedules.find(
          (cinema) => cinema.id === cinemaId
        );
        if (cinemaSchedule) {
          const { hourSchedules } = cinemaSchedule;
          hourSchedules.push(newHourSchedule);
        } else {
          cinemaSchedules.push(newCinemaSchedule);
        }
        transaction.update(doc(db, "schedules", scheduleDoc.id), {
          cinemaSchedules,
        });
      });

      setStatus("Tải lên thành công");
      toast.success("Thêm lịch chiếu thành công", toastConfig);
    } catch (err) {
      console.error(err);
      toast.error(`Có lỗi xảy ra. ${err.message}`, toastConfig);
    } finally {
      setTimeout(() => {
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
                    name="cinemaId"
                    label="Chọn rạp"
                    register={register}
                    disableDefault={false}
                    options={cinemaOptions}
                    onChange={(e) => setCinemaId(e.target?.value || undefined)}
                  />
                  <Select
                    name="room"
                    label="Chọn phòng chiếu"
                    register={register}
                    disableDefault={false}
                    options={roomOptions}
                  />
                  <Select
                    name="movieId"
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
                  <Select
                    name="showType"
                    label="Loại chiếu"
                    register={register}
                    disableDefault={false}
                    options={showTypeOptions}
                    defaultValue={showTypeOptions[0] || ""}
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
