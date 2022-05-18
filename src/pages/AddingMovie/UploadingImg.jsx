import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ReactComponent as UploadIcon } from "../../../assets/upload-image.svg";
const UploadingImg = ({ onSetImg, img }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      if (!(acceptedFiles[0] instanceof Blob)) {
        return;
      }
      onSetImg(acceptedFiles[0]);
    } catch (e) {
      console.log(e);
    }
  }, []);
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: img ? true : false,
    accept: {
      image: "image/*",
    },
  });

  return (
    <>
      <div
        {...getRootProps({
          style: {
            display: "flex",
            width: "80%",
            height: "350px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#bdbdbd",
            border: "2px dashed #8c8c8c",
            borderRadius: "10px",
            position: "relative",
          },
        })}
      >
        <input {...getInputProps()} />
        {img ? (
          <>
            <div className="h-full p-4 flex justify-center items-center">
              <img
                src={URL.createObjectURL(img)}
                className="h-full max-w-full"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col text-gray-light items-center gap-1">
            <UploadIcon width="80" height="80" />
            <span className="font-bold text-2xl">Chọn một ảnh để tải lên</span>
            <p>hoặc kéo thả vào đây</p>
          </div>
        )}
        {img && (
          <button
            onClick={() => open()}
            type="button"
            className="btn btn-sm absolute bottom-[5px] left-[5px]"
          >
            Chọn lại
          </button>
        )}
      </div>
    </>
  );
};

export default UploadingImg;
