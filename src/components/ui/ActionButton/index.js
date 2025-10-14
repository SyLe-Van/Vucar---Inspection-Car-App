import { IconButton, Tooltip } from "@mui/material";

export default function ActionButton({
  icon: Icon,
  tooltip,
  onClick,
  variant = "default",
  size = 24,
}) {
  const getButtonStyle = () => {
    const baseStyle = {
      minWidth: "46px",
      maxWidth: "46px",
      width: "46px",
      height: "46px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 !important",
      margin: "0",
      borderRadius: "10px",
      transition: "all 0.25s ease",
      "& svg": {
        width: `${size}px !important`,
        height: `${size}px !important`,
        display: "block",
        margin: "auto",
      },
    };

    const variants = {
      default: {
        color: "#ffffff",
        backgroundColor: "transparent",
        border: "2px solid rgba(255, 255, 255, 0.6)",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          border: "2px solid rgba(255, 255, 255, 0.9)",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.25)",
        },
      },
      delete: {
        color: "#ffffff",
        backgroundColor: "rgba(220, 53, 69, 0.3)",
        border: "2px solid rgba(220, 53, 69, 0.8)",
        "&:hover": {
          backgroundColor: "#dc3545",
          border: "2px solid #dc3545",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(220, 53, 69, 0.5)",
        },
      },
      save: {
        color: "#ffffff",
        backgroundColor: "rgba(40, 167, 69, 0.3)",
        border: "2px solid rgba(40, 167, 69, 0.8)",
        "&:hover": {
          backgroundColor: "#28a745",
          border: "2px solid #28a745",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(40, 167, 69, 0.5)",
        },
      },
      cancel: {
        color: "#ffffff",
        backgroundColor: "rgba(108, 117, 125, 0.3)",
        border: "2px solid rgba(108, 117, 125, 0.8)",
        "&:hover": {
          backgroundColor: "#6c757d",
          border: "2px solid #6c757d",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(108, 117, 125, 0.5)",
        },
      },
    };

    return {
      ...baseStyle,
      ...variants[variant],
    };
  };

  return (
    <Tooltip title={tooltip}>
      <IconButton onClick={onClick} sx={getButtonStyle()}>
        <Icon />
      </IconButton>
    </Tooltip>
  );
}
