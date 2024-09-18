import ListItem from "./ListItem";
import styles from "./styles.module.scss";

export default function List({ cars, setCars }) {
  return (
    <ul className={styles.list}>
      {Array.isArray(cars) ? (
        cars.map((car) => (
          <ListItem car={car} key={car._id} setCars={setCars} />
        ))
      ) : (
        <li>No cars available</li>
      )}
    </ul>
  );
}
