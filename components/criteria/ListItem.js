import axios from "axios";
import { useRef } from "react";
import { useState } from "react";
import { AiFillDelete, AiTwotoneEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import { Button } from "@mui/material";
export default function ListItem({ criteries, setCriteries }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const input = useRef(null);
  const handleRemove = async (id) => {
    try {
      const { data } = await axios.delete("/api/v1/criteria", {
        data: { id },
      });
      setCriteries(data.criteries);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const handleUpdate = async (id) => {
    try {
      const { data } = await axios.put("/api/v1/criteria", {
        id,
        name: name || criteries.name,
        description: description || criteries.description,
      });
      setCriteries(data.criteries);
      setOpen(false);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <li className={styles.list_item}>
      <input
        className={open ? styles.open : ""}
        type="text"
        value={name ? name : criteries.name}
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
            onClick={() => handleUpdate(criteries._id)}
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
        {!open && (
          <AiTwotoneEdit
            onClick={() => {
              setOpen((prev) => !prev);
              input.current.focus();
            }}
          />
        )}
        <AiFillDelete onClick={() => handleRemove(criteries._id)} />
      </div>
    </li>
  );
}
