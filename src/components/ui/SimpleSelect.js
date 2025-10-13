import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const SimpleSelect = ({ value, onChange, label = "Status", name }) => {
  const options = [
    { value: 0, label: "Not inspected" },
    { value: 1, label: "Inspecting" },
    { value: 2, label: "Inspected" },
  ];

  const handleChange = event => {
    console.log("SimpleSelect onChange:", event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl sx={{ minWidth: 250 }}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        value={value || ""}
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

export default SimpleSelect;
