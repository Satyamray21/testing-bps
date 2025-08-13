import React, { useRef, useEffect, useState } from 'react';
import {
    Box, Button, Typography, TableContainer, Table,
    TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Modal, Box as ModalBox
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { useReactToPrint } from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { allLedger, sendInvoices } from '../../../features/customerLedger/customerLedgerSlice';
import InvoicePDF from '../../../Components/InvoicePdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const LedgerHistory = () => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const invoiceRef = useRef();
    const componentRef = useRef();
    const dispatch = useDispatch();
    const [openModal, setOpenModal] = React.useState(false);
    const { invoices: invoiceData } = useSelector((state) => state.ledger);

    const handleSharePDF = async () => {
        setTimeout(async () => {
            const input = invoiceRef.current;
            try {
                const canvas = await html2canvas(input, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                const blob = pdf.output('blob');

                const formData = new FormData();
                formData.append('file', blob, `invoice-${selectedInvoice?.invoiceId || 'download'}.pdf`);
                formData.append('bookingId', selectedInvoice?.bookingId);
                formData.append('email', selectedInvoice?.email);

                dispatch(sendInvoices(formData));
            } catch (error) {
                console.error('PDF generation error:', error);
            }
        }, 300);
    };

    useEffect(() => {
        dispatch(allLedger());
    }, [dispatch]);

    useEffect(() => {
        console.log("Ledger Invoice Data: ", invoiceData);
    }, [invoiceData]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleInvoicePrint = useReactToPrint({
        content: () => invoiceRef.current,
        documentTitle: 'Invoice',
        onAfterPrint: () => setSelectedInvoice(null),
    });

    useEffect(() => {
        if (selectedInvoice) {
            const timer = setTimeout(handleInvoicePrint, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedInvoice]);


    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Customer Invoice
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Print
                </Button>
            </Box>

            <TableContainer component={Paper} ref={componentRef}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1565c0' }}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>S.No</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Invoice ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Order Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Total Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Remaining Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Invoice</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoiceData.map((invoice, index) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{invoice.invoiceId}</TableCell>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.name}</TableCell>
                                <TableCell>{invoice.amount}</TableCell>
                                <TableCell>{invoice.paidAmount}</TableCell>
                                <TableCell>{invoice.remainingAmount}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => {
                                            setOpenModal(true);
                                            setSelectedInvoice(invoice);
                                            setTimeout(handleInvoicePrint, 300);
                                        }}
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '95vh',
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 5,
                        bgcolor: '#ffffff',
                        '@media print': {
                            boxShadow: 'none',
                            borderRadius: 0,
                            width: '100%',
                            padding: 0,
                        },
                    }}
                >
                    {selectedInvoice && (
                        <InvoicePDF
                            ref={invoiceRef}
                            invoice={selectedInvoice}
                            bookingId={selectedInvoice?.bookingId}
                            onClose={() => setOpenModal(false)}
                            onPrint={handleInvoicePrint}
                            onShare={handleSharePDF}
                        />
                    )}
                </Box>
            </Modal>


        </Box>
    );
};

export default LedgerHistory;