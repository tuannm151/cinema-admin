import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const Input = ({
  label,
  name,
  register,
  required,
  className = "",
  type = "text",
  placeholder = "Nhập tại đây",
  defaultValue = "",
  isLoading = false,
}) => {
  const labelEl = isLoading ? (
    <SkeletonTheme>
      <Skeleton width={100} height={20} />
    </SkeletonTheme>
  ) : (
    <span className="label-text">{label}</span>
  );
  const inputEl = isLoading ? (
    <SkeletonTheme>
      <Skeleton height={48} />
    </SkeletonTheme>
  ) : (
    <input
      type={type}
      placeholder={placeholder}
      className="input input-bordered w-full max-w-xs"
      {...register(name, { required })}
      defaultValue={defaultValue}
    />
  );
  return (
    <div className={`form-control w-full max-w-xs ${className || ""}`}>
      <label className="label">{labelEl}</label>
      {inputEl}
    </div>
  );
};

export default Input;
