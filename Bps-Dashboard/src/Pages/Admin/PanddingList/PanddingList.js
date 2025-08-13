import React, { useState } from 'react';
import {
    Box, Typography, Paper, Table, TableHead,
    TableRow, TableCell, TableBody, TextField
} from '@mui/material';

const PanddingList = () => {

    const customers = [
        {
            customerId: "1",
            name: "SEASONS  ENTERPRISES  PVT LTD",
            email: "seasons@gmail.com",
            contact: 9819684214,
            totalBookings: 3,
            unpaidBookings: 3,
            totalAmount: 5054,
            totalPaid: 0,
            pendingAmount: 5054
        },
        {
            customerId: "2",
            name: "Global Tech Pvt Ltd",
            email: "globaltech@gmail.com",
            contact: 9876543210,
            totalBookings: 5,
            unpaidBookings: 2,
            totalAmount: 8000,
            totalPaid: 3000,
            pendingAmount: 5000
        },
        {
            customerId: "3",
            name: "Shubham Transport",
            email: "shubham@gmail.com",
            contact: 9900112233,
            totalBookings: 2,
            unpaidBookings: 1,
            totalAmount: 2000,
            totalPaid: 1000,
            pendingAmount: 1000
        }
    ];


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
