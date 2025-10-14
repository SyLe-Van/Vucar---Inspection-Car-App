import ListItem from "./ListItem";
import styles from "./styles.module.scss";
import { Box, Typography } from "@mui/material";

export default function List({ cars, setCars }) {
  return (
    <Box sx={{ marginTop: "24px" }}>
      <Typography
        variant="h6"
        sx={{
          color: "#029af2",
          fontWeight: 700,
          fontSize: "20px",
          marginBottom: "16px",
          paddingLeft: "4px",
        }}
      >
        Car List
      </Typography>
      <ul className={styles.list}>
        {Array.isArray(cars) && cars.length > 0 ? (
          cars.map(car => (
            <ListItem car={car} key={car._id} setCars={setCars} />
          ))
        ) : (
          <Box
            sx={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No cars available
          </Box>
        )}
      </ul>
    </Box>
  );
}
