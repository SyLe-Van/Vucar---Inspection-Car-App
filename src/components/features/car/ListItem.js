import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { AiFillDelete, AiTwotoneEdit } from "react-icons/ai";
import { MdSave, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { FaRegEye, FaCar } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";
import { FaTruckPickup, FaCarSide } from "react-icons/fa";
import { RiCarFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { fetchInspectionByCarId } from "@/store/carSlice";
import ActionButton from "@/components/ui/ActionButton";

export default function ListItem({ car, setCars }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const inspection = useSelector(state => state.car.inspection);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const input = useRef(null);
  const handleRemove = async id => {
    try {
      await axios.delete(`/api/v1/inspection`, {
        data: { car_id: id },
      });
      const { data } = await axios.delete("/api/v1/car", {
        data: { id },
      });

      setCars(prevCars => prevCars.filter(car => car._id !== id));
      toast.success("Car have been deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  const handleUpdate = async id => {
    try {
      const { data } = await axios.put("/api/v1/car", {
        id,
        name,
      });

      // Cập nhật car trong danh sách với thông tin đầy đủ từ API
      setCars(data.cars);

      setOpen(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };
  const handleClick = async () => {
    await dispatch(fetchInspectionByCarId(car._id));
    router.push(`/car/${car.slug}`);
  };

  const getStatusText = status => {
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

  const getStatusClass = status => {
    switch (status) {
      case 0:
        return styles.status_not_inspected;
      case 1:
        return styles.status_inspecting;
      case 2:
        return styles.status_inspected;
      default:
        return "";
    }
  };

  const getCarIconAndColor = () => {
    // Tạo hash từ car ID để chọn icon và màu sắc nhất quán
    const hash = car._id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const iconIndex = hash % 5;
    const colorIndex = hash % 8;

    const icons = [FaCar, IoCarSportSharp, FaTruckPickup, FaCarSide, RiCarFill];

    const colors = [
      "#FF6B6B", // Đỏ
      "#4ECDC4", // Xanh ngọc
      "#FFD93D", // Vàng
      "#A8E6CF", // Xanh mint
      "#FF8C94", // Hồng
      "#95E1D3", // Xanh biển nhạt
      "#F38181", // Đỏ cam
      "#AA96DA", // Tím
    ];

    const CarIcon = icons[iconIndex];
    const color = colors[colorIndex];

    return { CarIcon, color };
  };

  const { CarIcon, color: carColor } = getCarIconAndColor();

  return (
    <li className={styles.list_item}>
      <div className={styles.car_name_container}>
        <CarIcon className={styles.car_icon} style={{ color: carColor }} />
        <div className={styles.car_info}>
          <input
            className={open ? styles.open : ""}
            type="text"
            value={name ? name : car.name}
            onChange={e => setName(e.target.value)}
            disabled={!open}
            ref={input}
          />
          {!open && car.licensePlate && (
            <span className={styles.license_plate}>{car.licensePlate}</span>
          )}
        </div>
      </div>
      <span className={`${styles.status} ${getStatusClass(car.status)}`}>
        {getStatusText(car.status)}
      </span>

      {open && (
        <div className={styles.list_item_expand}>
          <ActionButton
            icon={MdSave}
            tooltip="Save changes"
            onClick={() => handleUpdate(car._id)}
            variant="save"
            size={22}
          />
          <ActionButton
            icon={MdCancel}
            tooltip="Cancel editing"
            onClick={() => {
              setOpen(false);
              setName("");
            }}
            variant="cancel"
            size={22}
          />
        </div>
      )}
      <div className={styles.list_item_actions}>
        <ActionButton
          icon={FaRegEye}
          tooltip="View details"
          onClick={handleClick}
          variant="default"
          size={22}
        />
        {!open && (
          <ActionButton
            icon={AiTwotoneEdit}
            tooltip="Edit car"
            onClick={() => {
              setOpen(prev => !prev);
              input.current.focus();
            }}
            variant="default"
            size={22}
          />
        )}
        <ActionButton
          icon={AiFillDelete}
          tooltip="Delete car"
          onClick={() => handleRemove(car._id)}
          variant="delete"
          size={22}
        />
      </div>
    </li>
  );
}
