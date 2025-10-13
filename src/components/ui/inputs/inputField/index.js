import { TextField } from "@mui/material";

export default function InputField({ onChange, label, value }) {
  return (
    <TextField
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
    />
  );
}
