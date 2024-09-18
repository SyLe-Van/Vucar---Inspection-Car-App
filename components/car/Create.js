import { Form, Formik } from "formik";
import { useState } from "react";
import styles from "./styles.module.scss";
import * as Yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
import dynamic from "next/dynamic";
import { Button, TextField } from "@mui/material";
const SelectHandler = dynamic(() => import("../select"), { ssr: false });

export default function Create({ setCars }) {
  const [status, setStatus] = useState("Status");

  const validate = Yup.object({
    name: Yup.string()
      .required("Car name is required.")
      .min(2, "Car name must be between 2 and 30 characters.")
      .max(30, "Car name must be between 2 and 30 characters."),
  });

  const submitHandler = async (values, { resetForm }) => {
    try {
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
        initialValues={{ name: "", status: "" }}
        validationSchema={validate}
        onSubmit={submitHandler}
      >
        {(formik) => (
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
                  sx={{ width: "535px" }}
                />
              </div>
              <div className={styles.form_item}>
                <SelectHandler
                  label="Status"
                  name="status"
                  value={formik.values.status}
                  onChange={(value) => {
                    setStatus(value);
                    formik.setFieldValue("status", value);
                  }}
                />
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
