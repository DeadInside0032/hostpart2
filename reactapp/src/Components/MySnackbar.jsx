import React from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function MySnackbar({ toastData, setToastData }) {

  const handleClose = (event, reason) => {
    setToastData({open: false});
  };

  return (
    <Snackbar
      autoHideDuration={2500}
      open={toastData.open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleClose}
    >
      <Alert severity={toastData.severity} sx={{ width: "100%" }}>
        {toastData.message}
      </Alert>
    </Snackbar>
  );
}
