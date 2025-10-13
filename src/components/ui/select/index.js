import React, { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material";

const SelectHandler = ({ onChange, value, label = "Status", name }) => {
  const options = [
    { value: 0, label: "Not inspected" },
    { value: 1, label: "Inspecting" },
    { value: 2, label: "Inspected" },
  ];

  const handleChange = e => {
    const selectedValue = e.target.value;
    console.log("Selected value:", selectedValue); // Debug log
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <Box sx={{ width: "100%", position: "relative", zIndex: 1000 }}>
      <FormControl sx={{ minWidth: 250, height: 56 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value !== undefined ? value : ""}
          onChange={handleChange}
          label={label}
          name={name}
          MenuProps={{
            PaperProps: {
              style: {
                zIndex: 1300,
              },
            },
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              onClick={() => console.log("MenuItem clicked:", option.value)} // Debug log
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default SelectHandler;
