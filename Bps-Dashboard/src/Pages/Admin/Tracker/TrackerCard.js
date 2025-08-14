import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const TrackerCard = () => {
      const [customerName, setCustomerName] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateInvoice = async () => {
    if (!customerName || !fromDate || !toDate) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v2/bookings/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          fromDate: fromDate.toISOString().split("T")[0],
          toDate: toDate.toISOString().split("T")[0],
        }),
      });

      if (response.ok && response.headers.get("content-type").includes("pdf")) {
        // Convert PDF blob to downloadable link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${customerName}_Invoice.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        setErrorMsg(data.message || "Failed to generate invoice");
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Generate Customer Invoice
      </Typography>

      <TextField
        fullWidth
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="From Date"
          value={fromDate}
          onChange={setFromDate}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
        <DatePicker
          label="To Date"
          value={toDate}
          onChange={setToDate}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>

      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleGenerateInvoice}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Generate Invoice"}
      </Button>
    </Paper>
  );
};


export default TrackerCard
