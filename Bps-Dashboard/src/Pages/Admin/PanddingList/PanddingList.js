import React, { useState,useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableHead,
    TableRow, TableCell, TableBody, TextField
} from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingCustomers } from  '../../../features/booking/bookingSlice';
const PanddingList = () => {

 const dispatch = useDispatch();

  const { customers, loading, error } = useSelector(
    (state) => state.bookings
  );



  useEffect(() => {
    dispatch(fetchPendingCustomers());
  }, [dispatch]);


    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter((cust) =>
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.contact.toString().includes(searchTerm)
    );


    return (
        <Box p={3}>
            <Box mb={2}>
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 500 }}
                />
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>S.NO</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Total Bookings</TableCell>
                            <TableCell>Unpaid Bookings</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Paid</TableCell>
                            <TableCell>Pending</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((cust, index) => (
                                <TableRow key={cust.customerId}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{cust.name}</TableCell>
                                    <TableCell>{cust.email}</TableCell>
                                    <TableCell>{cust.contact}</TableCell>
                                    <TableCell>{cust.totalBookings}</TableCell>
                                    <TableCell>{cust.unpaidBookings}</TableCell>
                                    <TableCell>₹{cust.totalAmount}</TableCell>
                                    <TableCell>₹{cust.totalPaid}</TableCell>
                                    <TableCell>₹{cust.pendingAmount}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No matching customers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default PanddingList;
