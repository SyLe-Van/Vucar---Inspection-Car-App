import * as React from "react";
import styles from "./styles.module.scss";
import { useState, useEffect } from "react";
import { Button, Checkbox, TextField } from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchInspectionByCarId } from "@/store/carSlice"; // Điều chỉnh đường dẫn
import { set } from "mongoose";

export default function CollapsibleTable({ car, criteries }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cars, setCars] = useState(car);
  const [selectedCount, setSelectedCount] = useState(0);
  // Sử dụng status từ car object thay vì tính toán lại
  const [status, setStatus] = useState(getStatusText(car.status));
  const [selectedCriteria, setSelectedCriteria] = useState(
    criteries.map(() => ({
      good: false,
      notGood: false,
      note: "",
    }))
  );

  const inspection = useSelector(state => state.car.inspection);

  function getStatusText(status) {
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
  }

  // Merge inspection data với tất cả criteries
  useEffect(() => {
    if (inspection && String(inspection.car) === String(cars._id)) {
      // Cập nhật status từ car object, không từ inspection
      setStatus(getStatusText(cars.status));

      console.log("Merging inspection data with criteries...");
      console.log("Inspection criteries:", inspection.criteries);
      console.log("All criteries:", criteries);

      // Map qua TẤT CẢ criteries và merge với inspection data nếu có
      const mergedCriteria = criteries.map(criteria => {
        // Tìm criteria tương ứng trong inspection (so sánh cả _id và name)
        const inspectedCriteria = inspection.criteries.find(
          ic =>
            String(ic.criteria_id) === String(criteria._id) ||
            ic.criteria_name === criteria.name
        );

        if (inspectedCriteria) {
          // Nếu đã được đánh giá, lấy dữ liệu từ inspection
          console.log(
            `Found inspected criteria: ${criteria.name}`,
            inspectedCriteria
          );
          return {
            good: inspectedCriteria.is_good,
            notGood:
              !inspectedCriteria.is_good && inspectedCriteria.note !== "",
            note: inspectedCriteria.note || "",
          };
        } else {
          // Nếu chưa đánh giá, để trống
          console.log(`Criteria not yet inspected: ${criteria.name}`);
          return {
            good: false,
            notGood: false,
            note: "",
          };
        }
      });

      console.log("Merged criteria:", mergedCriteria);
      setSelectedCriteria(mergedCriteria);
    } else {
      // Nếu không có inspection, dùng status từ car
      setStatus(getStatusText(cars.status));
    }
  }, [inspection, cars._id, cars.status, criteries]);

  // Chỉ đếm số criteria đã được đánh giá, không tự động thay đổi status
  useEffect(() => {
    const count = selectedCriteria.reduce(
      (acc, curr) => acc + (curr.good || curr.notGood ? 1 : 0),
      0
    );
    setSelectedCount(count);
  }, [selectedCriteria]);

  const handleCheckboxChange = (index, type) => event => {
    const isChecked = event.target.checked;
    setSelectedCriteria(prevSelected =>
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

  const handleInputChange = index => event => {
    const value = event.target.value;
    setSelectedCriteria(prevSelected =>
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
    // Đếm số criteria đã được đánh giá (good hoặc notGood được chọn)
    const evaluatedCount = selectedCriteria.filter(
      item => item.good || item.notGood
    ).length;

    // Tổng số criteria
    const totalCriteria = criteries.length;

    // Kiểm tra có ít nhất 1 criteria được đánh giá
    if (evaluatedCount === 0) {
      toast.error("Please evaluate at least one criterion before saving.");
      return;
    }

    // Logic status:
    // - Inspected (2): Tất cả criteria đã được đánh giá
    // - Inspecting (1): Một số criteria đã được đánh giá nhưng chưa đầy đủ
    // - Not inspected (0): Chưa có criteria nào được đánh giá
    let carStatus = 0;
    if (evaluatedCount === totalCriteria && totalCriteria > 0) {
      carStatus = 2; // Inspected - đã đánh giá đầy đủ
    } else if (evaluatedCount > 0) {
      carStatus = 1; // Inspecting - đang đánh giá
    } else {
      carStatus = 0; // Not inspected - chưa đánh giá
    }

    console.log(
      `Status calculation: ${evaluatedCount}/${totalCriteria} criteria evaluated -> status: ${carStatus}`
    );

    setStatus(getStatusText(carStatus));

    // Chỉ gửi những criteria đã được đánh giá (good hoặc notGood = true)
    const evaluatedCriteria = criteries
      .map((criteria, index) => {
        const item = selectedCriteria[index];
        // Chỉ lấy criteria đã được đánh giá
        if (item && (item.good || item.notGood)) {
          const isGood = item.good;
          const result = {
            criteria_id: criteria._id,
            criteria_name: criteria.name,
            is_good: isGood,
          };
          // Nếu not good, phải có note (nếu không có thì dùng giá trị mặc định)
          if (!isGood) {
            result.note =
              item.note && item.note.trim() !== ""
                ? item.note
                : "No note provided";
          }
          return result;
        }
        return null;
      })
      .filter(item => item !== null); // Loại bỏ các null

    const inspectionData = {
      car_id: cars._id,
      status: carStatus,
      criteries: evaluatedCriteria,
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
        {criteries.map((criteria, index) => (
          <div key={index} className={styles.container_item}>
            <span>{index + 1}</span>
            <span>{criteria.name}</span>
            <span>{criteria.description}</span>
            <Checkbox
              checked={selectedCriteria[index]?.notGood || false}
              onChange={handleCheckboxChange(index, "notGood")}
            />
            <Checkbox
              checked={selectedCriteria[index]?.good || false}
              onChange={handleCheckboxChange(index, "good")}
            />

            {selectedCriteria[index]?.notGood && (
              <TextField
                label="Note"
                variant="outlined"
                value={selectedCriteria[index]?.note || ""}
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
