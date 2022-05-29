import React, { memo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
const Select = ({
  label,
  name,
  register,
  disableDefault = true,
  options,
  defaultValue = options[0].value,
  isLoading = false,
  onChange = () => {},
}) => {
  const labelEl = isLoading ? (
    <SkeletonTheme>
      <Skeleton width={100} height={20} />
    </SkeletonTheme>
  ) : (
    <span className="label-text">{label}</span>
  );

  const selectEl = isLoading ? (
    <SkeletonTheme>
      <Skeleton height={48} />
    </SkeletonTheme>
  ) : (
    <select
      className="select select-bordered w-full"
      {...register(name)}
      defaultValue={defaultValue}
      onChange={onChange}
      required
    >
      <option value={options[0].value} disabled={disableDefault}>
        {options[0].label}
      </option>
      {options.slice(1).map((option, index) => {
        return (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
  return (
    <div className="flex flex-col w-full max-w-xs">
      <label className="label">{labelEl}</label>
      {selectEl}
    </div>
  );
};

export default memo(Select);
