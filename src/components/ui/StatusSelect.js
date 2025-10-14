import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const StatusSelect = ({
  value,
  onChange,
  label = "Status",
  name = "status",
}) => {
  const options = [
    { value: 0, label: "Not inspected" },
    { value: 1, label: "Inspecting" },
    { value: 2, label: "Inspected" },
  ];

  const handleChange = event => {
    const selectedValue = Number(event.target.value);
    console.log("StatusSelect onChange:", selectedValue);
    if (onChange) {
      onChange(selectedValue);
    }
  };

  // Đảm bảo value luôn là number hợp lệ
  const currentValue = Number(value);
  const isValidValue = [0, 1, 2].includes(currentValue);

  console.log("StatusSelect render:", {
    originalValue: value,
    currentValue: currentValue,
    isValidValue: isValidValue,
  });

  return (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-select-label`}
        id={`${name}-select`}
        value={isValidValue ? currentValue : ""}
        label={label}
        onChange={handleChange}
        name={name}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StatusSelect;
