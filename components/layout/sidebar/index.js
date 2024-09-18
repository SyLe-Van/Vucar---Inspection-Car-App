import { useDispatch, useSelector } from "react-redux";
import styles from "./styles.module.scss";
import { toggleSidebar } from "../../../store/ExpandSlice";
//-----------------------
import { MdArrowForwardIos } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { FaCar } from "react-icons/fa";

//-----------------------
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
export default function Sidebar() {
  const router = useRouter();
  const route = router.pathname.split("/")[1];
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { expandSidebar } = useSelector((state) => ({ ...state }));
  const expand = expandSidebar.expandSidebar;
  const handleExpand = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className={`${styles.sidebar} ${expand ? styles.opened : ""}`}>
      <div className={styles.sidebar_toggle} onClick={() => handleExpand()}>
        <div
          style={{
            transform: `${expand ? "rotate(180deg)" : ""}`,
            transition: "all .2s",
          }}
        >
          <MdArrowForwardIos />
        </div>
      </div>
      <div className={styles.sidebar_container}>
        <div className={styles.sidebar_user}>
          <Link href="/">
            <Image
              src={"/images/logo.png"}
              alt=""
              width={50}
              height={50}
              className={styles.sidebar_user_img}
            />
          </Link>
          <div className={styles.show}>
            <span className={styles.logo}>vucar</span>
          </div>
        </div>
        <div className={styles.sidebar_dropdown}>
          <ul className={styles.sidebar_list}>
            <Link href="/cars">
              <li className={route == "cars" ? styles.active : ""}>
                <Link href="/cars">
                  <FaCar />
                  <span className={styles.show}>Car</span>
                </Link>
              </li>
            </Link>
            <Link href="/criteria">
              <li className={route == "criteria" ? styles.active : ""}>
                <Link href="/criteria">
                  <div style={{ transform: "rotate(180deg)" }}>
                    <FaClipboardList />
                  </div>
                  <span className={styles.show}>Criteria</span>
                </Link>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </div>
  );
}
