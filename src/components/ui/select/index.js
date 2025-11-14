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
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <Box sx={{ width: "100%", position: "relative", zIndex: 1000 }}>
      <FormControl
        sx={{
          minWidth: 250,
          height: 56,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 2px 8px rgba(2, 154, 242, 0.15)",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(2, 154, 242, 0.1)",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#029af2",
                borderWidth: "2px",
              },
            },
          },
          "& .MuiInputLabel-root": {
            "&.Mui-focused": {
              color: "#029af2",
              fontWeight: 600,
            },
          },
        }}
      >
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
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                marginTop: "8px",
              },
            },
          }}
          sx={{
            "& .MuiMenuItem-root": {
              transition: "all 0.2s ease",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(2, 154, 242, 0.1) 0%, rgba(2, 117, 216, 0.1) 100%)",
                transform: "translateX(4px)",
              },
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #029af2 0%, #0275d8 100%)",
                color: "#fff",
                fontWeight: 600,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0275d8 0%, #025aa5 100%)",
                },
              },
            },
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                padding: "12px 16px",
                fontSize: "15px",
              }}
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
