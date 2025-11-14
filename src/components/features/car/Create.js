import { Form, Formik } from "formik";
import styles from "./styles.module.scss";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import { Button, TextField, Paper, Box, Typography } from "@mui/material";
import { FaCar } from "react-icons/fa";
import StatusSelect from "@/components/ui/StatusSelect";

export default function Create({ setCars }) {
  // Hàm format biển số xe tự động
  const formatLicensePlate = value => {
    // Loại bỏ tất cả ký tự không phải chữ và số
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();

    // Nếu rỗng, return
    if (!cleaned) return "";

    // Tìm vị trí chuyển từ chữ sang số
    const letterToNumberIndex = cleaned.search(/\d/);

    if (letterToNumberIndex > 0) {
      // Nếu tìm thấy vị trí chuyển từ chữ sang số
      const letters = cleaned.slice(0, letterToNumberIndex);
      const numbers = cleaned.slice(letterToNumberIndex);
      return `${letters}-${numbers}`;
    }

    // Nếu chỉ toàn chữ hoặc toàn số, return như cũ
    return cleaned;
  };

  const validate = Yup.object({
    name: Yup.string()
      .required("Car name is required.")
      .min(2, "Car name must be between 2 and 30 characters.")
      .max(30, "Car name must be between 2 and 30 characters."),
    licensePlate: Yup.string()
      .required("License plate is required.")
      .min(2, "License plate must be at least 2 characters.")
      .max(15, "License plate must be at most 15 characters.")
      .matches(
        /^[A-Z0-9\s-]+$/i,
        "License plate can only contain letters, numbers, spaces, and hyphens."
      ),
    status: Yup.number()
      .required("Status is required.")
      .oneOf([0, 1, 2], "Please select a valid status."),
  });

  const submitHandler = async (values, { resetForm }) => {
    try {
      const { data } = await axios.post("/api/v1/car", {
        name: values.name,
        licensePlate: values.licensePlate.toUpperCase().trim(),
        status: values.status,
      });
      if (data.message && data.car) {
        setCars(data.car);
        resetForm();
        toast.success(data.message);
      } else {
        toast.error("Car creation failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred!.");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #029af2 0%, #0275d8 100%)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <FaCar style={{ fontSize: "28px", color: "white" }} />
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: "24px",
            letterSpacing: "0.5px",
          }}
        >
          Car Information
        </Typography>
      </Box>
      <Formik
        initialValues={{ name: "", licensePlate: "", status: 0 }}
        validationSchema={validate}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={submitHandler}
      >
        {formik => (
          <Form>
            <Box sx={{ padding: "32px" }}>
              <div className={styles.form_row}>
                <div className={styles.form_item}>
                  <TextField
                    label="Car name"
                    variant="outlined"
                    name="name"
                    required
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.name &&
                      Boolean(formik.errors.name) &&
                      (formik.values.name !== "" || formik.submitCount > 0)
                    }
                    helperText={
                      formik.touched.name &&
                      (formik.values.name !== "" || formik.submitCount > 0)
                        ? formik.errors.name
                        : ""
                    }
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#029af2",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#029af2",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#029af2",
                      },
                    }}
                  />
                </div>
                <div className={styles.form_item}>
                  <TextField
                    label="License Plate"
                    variant="outlined"
                    name="licensePlate"
                    placeholder="e.g., ABC1234 → ABC-1234"
                    required
                    value={formik.values.licensePlate}
                    onChange={e => {
                      const formatted = formatLicensePlate(e.target.value);
                      formik.setFieldValue("licensePlate", formatted);
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.licensePlate &&
                      Boolean(formik.errors.licensePlate) &&
                      (formik.values.licensePlate !== "" ||
                        formik.submitCount > 0)
                    }
                    helperText={
                      formik.touched.licensePlate &&
                      (formik.values.licensePlate !== "" ||
                        formik.submitCount > 0)
                        ? formik.errors.licensePlate
                        : ""
                    }
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#029af2",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#029af2",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#029af2",
                      },
                    }}
                  />
                </div>
              </div>

              <div className={styles.form_row} style={{ marginTop: "24px" }}>
                <div className={styles.form_item}>
                  <StatusSelect
                    label="Status"
                    name="status"
                    value={formik.values.status}
                    onChange={value => {
                      formik.setFieldValue("status", value);
                    }}
                  />
                  {formik.touched.status && formik.errors.status && (
                    <div
                      style={{
                        color: "#dc3545",
                        fontSize: "0.875rem",
                        marginTop: "3px",
                        fontWeight: 500,
                      }}
                    >
                      {formik.errors.status}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.btnWrap}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #029af2 0%, #0275d8 100%)",
                    color: "white",
                    padding: "10px 32px",
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(2, 154, 242, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #0275d8 0%, #025ba8 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(2, 154, 242, 0.4)",
                    },
                  }}
                >
                  Add Car
                </Button>
              </div>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
}
