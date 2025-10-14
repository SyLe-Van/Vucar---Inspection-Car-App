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

  const getStatusText = status => {
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

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "none" },
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(2, 154, 242, 0.04)",
            transform: "scale(1.001)",
          },
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              backgroundColor: open ? "primary.main" : "transparent",
              color: open ? "white" : "inherit",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                transform: "rotate(180deg)",
              },
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#1a1a1a",
          }}
          component="th"
          scope="row"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>{row.car?.name}</span>
            {row.car?.licensePlate && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#333",
                  fontWeight: 600,
                  backgroundColor: "#e8f4fd",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  border: "1px solid #029af2",
                  letterSpacing: "0.5px",
                  border: "1px solid #ddd",
                }}
              >
                {row.car.licensePlate}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell>
          <span className={getStatusClass(row.status)}>
            {getStatusText(row.status)}
          </span>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "& > *": { borderBottom: "none" } }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                backgroundColor: "rgba(2, 154, 242, 0.02)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{
                  color: "#029af2",
                  fontWeight: 700,
                  fontSize: "18px",
                  borderBottom: "2px solid #029af2",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                }}
              >
                Inspection criteria
              </Typography>
              {row.criteries && row.criteries.length > 0 ? (
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "rgba(2, 154, 242, 0.1)",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "#dc3545" }}
                      >
                        Not Good
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "#28a745" }}
                      >
                        Good
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.criteries.map((criterion, index) => (
                      <TableRow
                        key={criterion.criteria_id || index}
                        sx={{
                          borderBottom: "none",
                          "&:hover": {
                            backgroundColor: "rgba(2, 154, 242, 0.05)",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {criterion.criteria_name}
                        </TableCell>
                        <TableCell align="center">
                          {!criterion.is_good ? (
                            <span
                              style={{
                                color: "#dc3545",
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              ✘
                            </span>
                          ) : (
                            ""
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {criterion.is_good ? (
                            <span
                              style={{
                                color: "#28a745",
                                fontSize: "20px",
                                fontWeight: "bold",
                              }}
                            >
                              ✔
                            </span>
                          ) : (
                            ""
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    py: 2,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  This car has not been inspected yet.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "& > *": { borderBottom: "none" } }}>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0, borderBottom: "none" }}
          colSpan={6}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                marginTop: 0,
                backgroundColor: "rgba(255, 193, 7, 0.05)",
                borderRadius: "8px",
                padding: "16px",
                borderLeft: "4px solid #ffc107",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{
                  color: "#e0a800",
                  fontWeight: 700,
                  fontSize: "18px",
                  borderBottom: "2px solid #ffc107",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📝</span>
                Notes
              </Typography>
              {row.criteries && row.criteries.length > 0 ? (
                <Table size="small" aria-label="purchases">
                  <TableBody>
                    {row.criteries
                      .filter(c => c.note) // Lọc những tiêu chí có trường note
                      .map((c, index) => (
                        <TableRow
                          key={c._id || index}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 193, 7, 0.08)",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              border: "none",
                              paddingY: "12px",
                            }}
                          >
                            <strong
                              style={{
                                color: "#e0a800",
                                fontSize: "15px",
                              }}
                            >
                              {c.criteria_name}
                            </strong>
                            <br />
                            <span
                              style={{
                                color: "#666",
                                fontSize: "14px",
                                lineHeight: "1.6",
                              }}
                            >
                              {c.note}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    py: 2,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  No notes available.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      {/* Spacer row để tạo khoảng cách giữa các xe */}
      <TableRow
        sx={{ height: "16px", "& > *": { borderBottom: "none", padding: 0 } }}
      >
        <TableCell colSpan={6} sx={{ backgroundColor: "transparent" }} />
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
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #029af2 0%, #0275d8 100%)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "28px" }}>🚗</span>
        <Typography
          variant="h5"
          component="div"
          sx={{
            color: "white",
            fontWeight: 700,
            fontSize: "24px",
            letterSpacing: "0.5px",
          }}
        >
          Car status overview
        </Typography>
      </Box>
      <Table aria-label="collapsible table" className={styles.table}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "60px" }} />
            <TableCell sx={{ fontSize: "16px", fontWeight: 600 }}>
              CAR
            </TableCell>
            <TableCell sx={{ fontSize: "16px", fontWeight: 600 }}>
              STATUS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <Row key={row.car.name + row.status} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
