import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { AiFillDelete, AiTwotoneEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

import { FaRegEye } from "react-icons/fa";
import { useRouter } from "next/router";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchInspectionByCarId } from "../../store/carSlice";
export default function ListItem({ car, setCars }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const inspection = useSelector((state) => state.car.inspection);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const input = useRef(null);
  const handleRemove = async (id) => {
    try {
      await axios.delete(`/api/v1/inspection`, {
        data: { car_id: id },
      });
      const { data } = await axios.delete("/api/v1/car", {
        data: { id },
      });

      setCars((prevCars) => prevCars.filter((car) => car._id !== id));
      toast.success("Car have been deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  const handleUpdate = async (id) => {
    try {
      const { data } = await axios.put("/api/v1/car", {
        id,
        name,
      });

      setCars((prevCars) =>
        prevCars.map((carItem) =>
          carItem._id === id ? { ...carItem, name: data.cars.name } : carItem
        )
      );

      setOpen(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  const handleClick = async () => {
    console.log("Current car in ListItem: ", car.name);
    console.log("Current car in ListItemID: ", car._id);
    await dispatch(fetchInspectionByCarId(car._id));
    router.push(`/car/${car.slug}`);
  };

  return (
    <li className={styles.list_item}>
      <input
        className={open ? styles.open : ""}
        type="text"
        value={name ? name : car.name}
        onChange={(e) => setName(e.target.value)}
        disabled={!open}
        ref={input}
      />

      {open && (
        <div className={styles.list_item_expand}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleUpdate(car._id)}
          >
            Save
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => {
              setOpen(false);
              setName("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      <div className={styles.list_item_actions}>
        <FaRegEye onClick={handleClick} />
        {!open && (
          <AiTwotoneEdit
            onClick={() => {
              setOpen((prev) => !prev);
              input.current.focus();
            }}
          />
        )}
        <AiFillDelete onClick={() => handleRemove(car._id)} />
      </div>
    </li>
  );
}
