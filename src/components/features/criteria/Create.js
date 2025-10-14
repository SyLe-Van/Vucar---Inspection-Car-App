import { Form, Formik } from "formik";
import styles from "./styles.module.scss";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import { Button, TextField, Box, Paper, Typography } from "@mui/material";
import { FaClipboardList } from "react-icons/fa";

export default function Create({ setCriteries }) {
  const validate = Yup.object({
    name: Yup.string()
      .required("Category name is required.")
      .min(2, "Category name must be between 2 and 30 characters.")
      .max(30, "Category name must be between 2 and 30 characters."),
    description: Yup.string().required("Description is required."),
  });

  const submitHandler = async (values, { resetForm }) => {
    try {
      const { data } = await axios.post("/api/v1/criteria", {
        name: values.name,
        description: values.description,
      });
      console.log("dataSub", data);
      if (data.message && data.criteries) {
        setCriteries(data.criteries);
        resetForm();
        toast.success(data.message);
      } else {
        toast.error("Criteria creation failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
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
        <FaClipboardList style={{ fontSize: "28px", color: "white" }} />
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
          Criteria Information
        </Typography>
      </Box>
      <Formik
        initialValues={{ name: "", description: "" }}
        validationSchema={validate}
        onSubmit={submitHandler}
      >
        {formik => (
          <Form>
            <Box sx={{ padding: "32px" }}>
              <div className={styles.form_row}>
                <div className={styles.form_item}>
                  <TextField
                    label="Criteria name"
                    variant="outlined"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
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
                    label="Criteria description"
                    variant="outlined"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    multiline
                    rows={1}
                    error={
                      formik.touched.description &&
                      Boolean(formik.errors.description)
                    }
                    helperText={
                      formik.touched.description && formik.errors.description
                    }
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
                  Add Criteria
                </Button>
              </div>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
}
