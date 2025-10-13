import ListItem from "./ListItem";
import styles from "./styles.module.scss";

export default function List({ criteries, setCriteries }) {
  return (
    <ul className={styles.list}>
      {Array.isArray(criteries) ? (
        criteries.map((criteries) => (
          <ListItem
            criteries={criteries}
            key={criteries._id}
            setCriteries={setCriteries}
          />
        ))
      ) : (
        <li>No cars available</li>
      )}
    </ul>
  );
}
