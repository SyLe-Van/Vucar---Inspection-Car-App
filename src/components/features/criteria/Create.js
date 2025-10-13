import { Form, Formik } from "formik";
import styles from "./styles.module.scss";
import * as Yup from "yup";

import { toast } from "react-toastify";
import axios from "axios";
import { Button, TextField } from "@mui/material";
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
    <>
      <Formik
        initialValues={{ name: "", description: "" }}
        validationSchema={validate}
        onSubmit={submitHandler}
      >
        {(formik) => (
          <Form>
            <span className={styles.header}>Criteria Information</span>
            <div className={styles.form_row}>
              <div className={styles.form_item}>
                <TextField
                  label="Criteria name"
                  variant="outlined"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{ width: "535px" }}
                />
              </div>
              <div className={styles.form_item}>
                <TextField
                  label="Criteria description"
                  variant="outlined"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  sx={{ width: "545px" }}
                />
              </div>
            </div>
            <div className={styles.btnWrap}>
              <Button type="submit" variant="outlined" color="primary">
                Add Criteria
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
