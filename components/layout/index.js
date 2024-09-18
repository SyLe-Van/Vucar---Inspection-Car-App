import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Sidebar from "./sidebar";
import styles from "./styles.module.scss";

export default function Layout({ children }) {
  const { expandSidebar } = useSelector((state) => ({ ...state }));
  const showSidebar = expandSidebar.expandSidebar;
  const dispatch = useDispatch();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div
        style={{ marginLeft: `${showSidebar ? "280px" : "80px"}` }}
        className={styles.layout_main}
      >
        {children}
      </div>
    </div>
  );
}
