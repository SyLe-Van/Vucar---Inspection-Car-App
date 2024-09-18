import * as React from "react";
import styles from "./styles.module.scss";
import { useState, useEffect } from "react";
import { Button, Checkbox, TextField } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchInspectionByCarId } from "../../../store/carSlice"; // Điều chỉnh đường dẫn
import { set } from "mongoose";

export default function CollapsibleTable({ car, criteries }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cars, setCars] = useState(car);
  const [criteriess, setCriteriess] = useState(criteries);
  const [selectedCount, setSelectedCount] = useState(0);
  const [status, setStatus] = useState("Not inspected");
  const [selectedCriteria, setSelectedCriteria] = useState(
    criteriess.map(() => ({
      good: false,
      notGood: false,
      note: "",
    }))
  );

  const inspection = useSelector((state) => state.car.inspection);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Not inspected";
      case 1:
        return "Inspecting";
      case 2:
        return "Inspected";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    if (inspection && inspection.car === cars._id) {
      setStatus(getStatusText(inspection.status));
      setCriteriess(inspection.criteries);
      setSelectedCriteria(
        inspection.criteries.map((criteria) => ({
          good: criteria.is_good,
          notGood: !criteria.is_good && criteria.note !== "",
          note: criteria.note || "",
        }))
      );
    }
  }, [inspection, cars._id]);

  useEffect(() => {
    const count = selectedCriteria.reduce(
      (acc, curr) => acc + (curr.good || curr.notGood ? 1 : 0),
      0
    );
    setSelectedCount(count);
  }, [selectedCriteria]);

  const handleCheckboxChange = (index, type) => (event) => {
    const isChecked = event.target.checked;
    setSelectedCriteria((prevSelected) =>
      prevSelected.map((item, idx) => {
        if (idx === index) {
          if (type === "good") {
            return {
              ...item,
              good: isChecked,
              notGood: isChecked ? false : item.notGood,
            };
          } else if (type === "notGood") {
            return {
              ...item,
              notGood: isChecked,
              good: isChecked ? false : item.good,
            };
          }
        }
        return item;
      })
    );
  };

  const handleInputChange = (index) => (event) => {
    const value = event.target.value;
    setSelectedCriteria((prevSelected) =>
      prevSelected.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            note: value,
          };
        }
        return item;
      })
    );
  };
  const handleSave = async () => {
    const passedCriteriaCount = selectedCriteria.filter(
      (item) => item.good
    ).length;
    const carStatus =
      passedCriteriaCount === 5 ? 2 : passedCriteriaCount > 0 ? 1 : 0;
    setStatus(carStatus);
    const inspectionData = {
      car_id: cars._id,
      status: carStatus,
      criteries: criteriess.map((criteria, index) => {
        const isGood = selectedCriteria[index].good;
        const result = {
          criteria_id: criteria._id,
          criteria_name: criteria.name,
          is_good: isGood,
        };
        if (!isGood) {
          result.note = selectedCriteria[index].note;
        }
        return result;
      }),
    };

    try {
      const response = await axios.post("/api/v1/inspection", inspectionData);
      if (response.status === 200) {
        toast.success("Saved successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.error(
        `Save failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>Car: {cars.name}</span>
        <span>Status: {status}</span>
      </div>
      <div className={styles.container}>
        <div className={styles.container_title}>
          <span>No.</span>
          <span className={styles.container_title_criteria}>Criteria</span>
          <span>Description</span>
          <span>Not good</span>
          <span>Good</span>
        </div>
        {criteriess.map((criteria, index) => (
          <div key={index} className={styles.container_item}>
            <span>{index + 1}</span>
            <span>{criteria.name}</span>
            <span>{criteria.description}</span>
            <Checkbox
              checked={selectedCriteria[index].notGood}
              onChange={handleCheckboxChange(index, "notGood")}
            />
            <Checkbox
              checked={selectedCriteria[index].good}
              onChange={handleCheckboxChange(index, "good")}
            />

            {selectedCriteria[index].notGood && (
              <TextField
                label="Note"
                variant="outlined"
                value={selectedCriteria[index].note}
                onChange={handleInputChange(index)}
                className={styles.input}
                sx={{ width: "1016px" }}
              />
            )}
          </div>
        ))}
      </div>
      <div className={styles.button}>
        <Button variant="outlined" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
