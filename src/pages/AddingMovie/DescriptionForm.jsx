import React from "react";

const DescriptionForm = ({ register, description }) => {
  return (
    <form className="w-full flex flex-col items-center my-6">
      <div className="w-3/4">
        <label className="label self-start">
          <span className="label-text text-base">Mô tả của phim</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full h-64 text-base"
          placeholder="Type here"
          {...register("description")}
          defaultValue={description}
          required
        ></textarea>
      </div>
    </form>
  );
};

export default DescriptionForm;
