import React from "react";
import Input from "../../../components/Input";
import Select from "../../../components/Select";

const ageRatingOptions = [
  {
    value: "",
    label: "Chọn một lựa chọn",
  },
  {
    label: "G",
    value: "G",
  },
  {
    label: "PG",
    value: "PG",
  },
  {
    label: "PG-13",
    value: "PG-13",
  },
  {
    label: "R",
    value: "R",
  },
  {
    label: "NC-17",
    value: "NC-17",
  },
];

const statusOptions = [
  {
    label: "Không có lịch",
    value: "noschedule",
  },
  {
    label: "Sắp chiếu",
    value: "upcoming",
  },
  {
    label: "Đang chiếu",
    value: "nowshowing",
  },
];

const InformationForm = ({ register, data, ratingData, isLoading = false }) => {
  return (
    <form className="grid grid-cols-2 justify-items-center gap-4 mt-10 flex-1">
      <Input
        label="Tên phim"
        name="title"
        register={register}
        isLoading={isLoading}
        defaultValue={data?.title || ""}
        required
      />
      <Input
        label="URL"
        name="urlId"
        register={register}
        isLoading={isLoading}
        defaultValue={data?.urlId || ""}
        required
      />
      <Input
        label="Độ dài"
        name="duration"
        register={register}
        required
        type="number"
        placeholder="Nhập tại đây (tính theo phút)"
        defaultValue={data?.duration || ""}
        isLoading={isLoading}
      />
      <Input
        label="Ngày ra rạp"
        name="releaseDate"
        register={register}
        required
        type="date"
        defaultValue={data?.releaseDate || ""}
        isLoading={isLoading}
      />
      <Input
        label="Trailer Youtube"
        name="trailerUrl"
        register={register}
        required
        defaultValue={data?.trailerUrl || ""}
        isLoading={isLoading}
      />
      <Input
        label="Thể loại"
        name="genres"
        register={register}
        required
        placeholder='Nhập cách nhau bằng dấu phẩy ","'
        defaultValue={data?.genres || ""}
        isLoading={isLoading}
      />
      <Input
        label="Điểm đánh giá (0-5)"
        name="rating"
        register={register}
        required
        defaultValue={data?.rating}
        type="number"
        isLoading={isLoading}
      />
      <Input
        label="Số lượt bình chọn"
        name="votes"
        register={register}
        required
        defaultValue={data?.votes}
        type="number"
        isLoading={isLoading}
      />

      <Select
        label="Chọn giới hạn tuổi"
        name="ageRating"
        register={register}
        disableDefault={true}
        defaultValue={data?.ageRating || ageRatingOptions[0].value}
        options={ageRatingOptions}
        isLoading={isLoading}
      />
      <Select
        label="Trạng thái phim"
        name="status"
        register={register}
        disableDefault={false}
        defaultValue={data?.status || statusOptions[0].value}
        options={statusOptions}
        isLoading={isLoading}
      />
    </form>
  );
};

export default InformationForm;
