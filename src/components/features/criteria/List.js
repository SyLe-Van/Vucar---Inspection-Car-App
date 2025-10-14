import ListItem from "./ListItem";
import styles from "./styles.module.scss";
import { Box, Typography } from "@mui/material";

export default function List({ criteries, setCriteries }) {
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
        Criteria List
      </Typography>
      <ul className={styles.list}>
        {Array.isArray(criteries) && criteries.length > 0 ? (
          criteries.map(criteries => (
            <ListItem
              criteries={criteries}
              key={criteries._id}
              setCriteries={setCriteries}
            />
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
            No criteria available
          </Box>
        )}
      </ul>
    </Box>
  );
}
