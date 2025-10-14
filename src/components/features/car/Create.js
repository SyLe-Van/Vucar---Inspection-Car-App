import { Form, Formik } from "formik";
import { useState } from "react";
import styles from "./styles.module.scss";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import dynamic from "next/dynamic";
import { Button, TextField } from "@mui/material";
import SimpleSelect from "@/components/ui/SimpleSelect";
import StatusSelect from "@/components/ui/StatusSelect";
const SelectHandler = dynamic(() => import("@/components/ui/select"), {
  ssr: false,
});

export default function Create({ setCars }) {
  const validate = Yup.object({
    name: Yup.string()
      .required("Car name is required.")
      .min(2, "Car name must be between 2 and 30 characters.")
      .max(30, "Car name must be between 2 and 30 characters."),
    status: Yup.number()
      .required("Status is required.")
      .oneOf([0, 1, 2], "Please select a valid status."),
  });

  const submitHandler = async (values, { resetForm }) => {
    try {
      console.log("Submitting values:", values); // Debug log
      const { data } = await axios.post("/api/v1/car", {
        name: values.name,
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
      console.log("error", error);
      toast.error(error.response?.data?.message || "An error occurred!.");
    }
  };

  return (
    <>
      <Formik
        initialValues={{ name: "", status: 0 }}
        validationSchema={validate}
        onSubmit={submitHandler}
      >
        {formik => (
          <Form>
            <span className={styles.header}>Car information</span>

            <div className={styles.form_row}>
              <div className={styles.form_item}>
                <TextField
                  label="Car name"
                  variant="outlined"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  sx={{ width: "535px" }}
                />
              </div>
              <div className={styles.form_item}>
                <StatusSelect
                  label="Status"
                  name="status"
                  value={formik.values.status}
                  onChange={value => {
                    console.log(
                      "Create component - StatusSelect onChange called with:",
                      value,
                      "type:",
                      typeof value
                    );
                    formik.setFieldValue("status", value);
                  }}
                />
                {formik.touched.status && formik.errors.status && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "0.875rem",
                      marginTop: "3px",
                    }}
                  >
                    {formik.errors.status}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.btnWrap}>
              <Button type="submit" variant="outlined" color="primary">
                Add car
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
