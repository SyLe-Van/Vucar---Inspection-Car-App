import React, { useState } from "react";
import { Radio, Select, Space } from "antd";

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
    <>
      <Space
        direction="vertical"
        style={{
          width: "100%",
        }}
      >
        <Select
          size={size}
          defaultValue="Status"
          onChange={handleChange}
          style={{
            width: 250,
            height: 56,
          }}
          options={options}
        />
      </Space>
    </>
  );
};
export default SelectHandler;
