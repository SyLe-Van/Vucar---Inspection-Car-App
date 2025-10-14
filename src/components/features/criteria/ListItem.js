import axios from "axios";
import { useRef } from "react";
import { useState } from "react";
import { AiFillDelete, AiTwotoneEdit } from "react-icons/ai";
import { MdSave, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import ActionButton from "@/components/ui/ActionButton";

export default function ListItem({ criteries, setCriteries }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const input = useRef(null);
  const handleRemove = async id => {
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
  const handleUpdate = async id => {
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
        onChange={e => setName(e.target.value)}
        disabled={!open}
        ref={input}
      />
      {open && (
        <div className={styles.list_item_expand}>
          <ActionButton
            icon={MdSave}
            tooltip="Save changes"
            onClick={() => handleUpdate(criteries._id)}
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
        {!open && (
          <ActionButton
            icon={AiTwotoneEdit}
            tooltip="Edit criteria"
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
          tooltip="Delete criteria"
          onClick={() => handleRemove(criteries._id)}
          variant="delete"
          size={22}
        />
      </div>
    </li>
  );
}
