import React, { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Box } from "@mui/material";

const SelectHandler = ({ onChange }) => {
  const [size, setSize] = useState("middle");
  const options = [
    { value: 0, label: "Not inspected" },
    { value: 1, label: "Inspecting" },
    { value: 2, label: "Inspected" },
  ];
  const handleChange = (value) => {
    onChange(value);
  };
  const handleSizeChange = (e) => {
    setSize(e.target.value);
  };
  return (
    <Box sx={{ width: "100%" }}>
      <FormControl sx={{ minWidth: 250, height: 56 }}>
        <InputLabel>Status</InputLabel>
        <Select value="" onChange={handleChange} label="Status">
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default SelectHandler;
