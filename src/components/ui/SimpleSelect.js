import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const SimpleSelect = ({ value, onChange, label = "Status", name }) => {
  const options = [
    { value: 0, label: "Not inspected" },
    { value: 1, label: "Inspecting" },
    { value: 2, label: "Inspected" },
  ];

  const handleChange = event => {
    console.log(
      "SimpleSelect onChange:",
      event.target.value,
      "type:",
      typeof event.target.value
    );
    if (onChange) {
      // Chuyển đổi về number vì Material-UI trả về string
      const numericValue = Number(event.target.value);
      onChange(numericValue);
    }
  };

  // Xử lý tất cả các trường hợp: number, string number, hoặc undefined/null
  let normalizedValue = "";
  if (value === 0 || value === "0") {
    normalizedValue = 0;
  } else if (value === 1 || value === "1") {
    normalizedValue = 1;
  } else if (value === 2 || value === "2") {
    normalizedValue = 2;
  }

  console.log(
    "SimpleSelect render - original value:",
    value,
    "type:",
    typeof value,
    "normalizedValue:",
    normalizedValue,
    "type:",
    typeof normalizedValue
  );

  return (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        value={normalizedValue}
        label={label}
        onChange={handleChange}
        name={name}
        displayEmpty={false}
        renderValue={selected => {
          const option = options.find(opt => opt.value === selected);
          return option ? option.label : "";
        }}
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

export default SimpleSelect;
