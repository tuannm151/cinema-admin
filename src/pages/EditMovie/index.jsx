import { useFirestoreQuery } from "@react-query-firebase/firestore";
import { collection, query } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../../../firebaseConfig";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import EditModal from "./EditModal";

const EditMovie = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
  const upcoming = docDatas?.filter((movie) => movie.status === "upcoming");
  const nowshowing = docDatas?.filter((movie) => movie.status === "nowshowing");
  console.log(upcoming, nowshowing);

  const handleOpenModal = (movieId) => {
    setModalOpen(true);
    setMovieId(movieId);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleSuccessUpdate = () => {};
  return (
    <>
      {modalOpen && (
        <EditModal
          onClose={handleCloseModal}
          movieId={movieId}
          onSuccessUpdate={handleSuccessUpdate}
        />
      )}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/*  Site header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main>
            <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <h1 className="font-bold mt-14 text-3xl">Sửa thông tin phim</h1>
              <p className="text-stone-500 text-xl">
                Danh sách phim đang hoạt động
              </p>
              <div className="w-full flex flex-col rounded-xl px-4 py-8 mt-10">
                <div className="flex flex-col gap-8">
                  <h1 className="font-bold text-2xl">Phim Đang chiếu</h1>
                  <div className="flex flex-wrap gap-8">
                    {nowshowing ? (
                      nowshowing.map((movie) => {
                        console.log(movie);
                        return (
                          <div
                            key={movie.id}
                            className="card image-full h-80 w-64 bg-base-100 shadow-xl "
                          >
                            <figure>
                              <img
                                src={`${
                                  movie.imageUrl
                                }?${new Date().getTime()}`}
                                alt="Movie poster"
                                className="h-full w-full absolute object-cover"
                              />
                            </figure>
                            <div className="card-body">
                              <h2 className="card-title flex-1 items-start">
                                {movie.title}
                              </h2>
                              <div className="card-actions flex justify-end gap-4">
                                <button
                                  onClick={() => handleOpenModal(movie.id)}
                                  className="btn btn-primary normal-case"
                                >
                                  Chỉnh sửa
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <h2>Loading...</h2>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <h1 className="font-bold text-2xl mt-8">Phim Sắp chiếu</h1>
                  <div className="flex flex-wrap gap-8">
                    {upcoming ? (
                      upcoming.map((movie) => {
                        console.log(movie);
                        return (
                          <div
                            key={movie.id}
                            className="card image-full h-80 w-64 bg-base-100 shadow-xl"
                          >
                            <figure>
                              <img
                                src={`${
                                  movie.imageUrl
                                }?${new Date().getTime()}`}
                                alt="Movie poster"
                                className="h-full w-full absolute object-cover"
                              />
                            </figure>
                            <div className="card-body">
                              <h2 className="card-title flex-1 items-start">
                                {movie.title}
                              </h2>
                              <div className="card-actions flex justify-end gap-4">
                                <button
                                  onClick={() => handleOpenModal(movie.id)}
                                  className="btn btn-primary normal-case"
                                >
                                  Chỉnh sửa
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <h2>Loading...</h2>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default EditMovie;
