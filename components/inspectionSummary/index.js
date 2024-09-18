import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import styles from "./styles.module.scss";
import Image from "next/image";

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Not inspected";
      case 1:
        return "Inspecting";
      case 2:
        return "Inspected";
      default:
        return "Unknown status";
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          style={{ fontWeight: "bold", fontSize: "18px" }}
          component="th"
          scope="row"
        >
          {row.car?.name}
        </TableCell>

        <TableCell>
          <span>{getStatusText(row.status)}</span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                style={{ color: "#029af2" }}
                variant="h6"
                gutterBottom
                component="div"
              >
                Inspection criteria
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow styles={styles.head}>
                    <TableCell>No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Not Good</TableCell>
                    <TableCell>Good</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.criteries.map((criterion, index) => (
                    <TableRow key={criterion.criteria_id}>
                      <TableCell>{index + 1}</TableCell>{" "}
                      <TableCell>{criterion.criteria_name}</TableCell>{" "}
                      <TableCell>{!criterion.is_good ? " ✘" : ""}</TableCell>{" "}
                      <TableCell>{criterion.is_good ? "✔" : ""}</TableCell>{" "}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, borderBottom: "none" }}
          colSpan={6}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                style={{ color: "#029af2" }}
                variant="h6"
                gutterBottom
                component="div"
              >
                Notes
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {row.criteries
                    .filter((c) => c.note) // Lọc những tiêu chí có trường note
                    .map((c) => (
                      <TableRow key={c._id}>
                        <TableCell>
                          <strong>{c.criteria_name}</strong> <br />
                          {c.note}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    car: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    status: PropTypes.number.isRequired,
    criteries: PropTypes.arrayOf(
      PropTypes.shape({
        criteria_id: PropTypes.string.isRequired,
        criteria_name: PropTypes.string.isRequired,
        is_good: PropTypes.bool.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default function InspectionSummary({ rows }) {
  return (
    <TableContainer component={Paper}>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        paddingX="5px"
        id="tableTitle"
        component="div"
        style={{ color: "#029af2", fontWeight: "bold", fontSize: "25px" }}
      >
        Car status overview
      </Typography>
      <Table aria-label="collapsible table" className={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell style={{ fontSize: "20px" }}>Car</TableCell>
            <TableCell style={{ fontSize: "20px" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.car.name + row.status} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
