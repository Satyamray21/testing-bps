import PDFDocument from 'pdfkit';
import pkg from 'pdfkit-table';
const { Table } = pkg;

export const generateInvoicePDF = async (customer, bookings,invoiceNo) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const lineHeight = 20;
        let y = 50;

        // === HEADER DETAILS ===
        const headerBooking = bookings?.[0] || {};
        const stationName = headerBooking?.startStation?.stationName || 'Bharat Parcel Services Pvt.Ltd.';
        const stationAddress = headerBooking?.startStation?.address || '332,Kucha Ghasi Ram,Chandni Chowk., Fatehpuri,Delhi -110006';
        const stationGST = headerBooking?.startStation?.gst || '07AAECB6506F1ZY';
        const stationContact = headerBooking?.startStation?.contact || '011-23955385,23830010'
        const stateCode = '07'; // from booking or static if needed

        const today = new Date();
        const dateOfBill = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        // Title
        doc.fontSize(16).text('TAX INVOICE', { align: 'center' });
        y += 30;

        doc.fontSize(12).text(stationName, 50, y); y += lineHeight;
        doc.text(stationAddress, 50, y); y += lineHeight;
        doc.text(`Phone No.: ${stationContact}`, 50, y); y += lineHeight;
        doc.text(`GSTIN: ${stationGST}    PAN: AAECB6506F    SAC CODE: 9968`, 50, y); y += lineHeight + 10;

        // === PARTY DETAILS ===
        const fullName = `${customer.firstName || ''} ${customer.middleName || ''} ${customer.lastName || ''}`.trim() || 'RARO HOUSE OF FASHION PVT. LTD.';
        const partyAddress = (customer.senderLocality || customer.address || 'A-67, NARAINA INDUSTRIAL AREA, PHASE-1,, NEW DELHI 110028').replace(/\r?\n/g, ', ');
        const senderState = customer.state || 'Delhi';
        const senderGst = customer.gstNumber || '07AAECR3140B1ZY';

        // Create a table-like structure for party details
        doc.text(`Party Name: ${fullName}`, 50, y);
        doc.text(`Date of Bill: ${dateOfBill}`, 350, y);
        doc.text(`INVOICE NO. ${invoiceNo}`, 500, y);
        y += lineHeight;

        doc.text(`State Code: ${stateCode}, ${senderState}`, 50, y);
        doc.text(`Type of Service: `, 350, y);
        y += lineHeight;

        doc.text(`GSTIN: ${senderGst}`, 50, y);
        y += lineHeight;

        doc.text(`Party Address: ${partyAddress}`, 50, y);
        y += lineHeight + 10;

        // === TABLE HEADER ===
        doc.font('Helvetica-Bold');
        
        // Draw table header with borders
        doc.lineWidth(0.5);
        
        // Draw horizontal lines
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 5;
        
        // Column headers
        doc.text('SR NO', 50, y);
        doc.text('DATE', 90, y);
        doc.text('POD NO', 140, y);
        doc.text('SENDOR PARTY', 200, y);
        doc.text('RECEIVER PARTY', 340, y);
        doc.text('NOS', 470, y);
        doc.text('WEIGHT', 500, y);
        doc.text('NS.', 550, y);
        doc.text('AMOUNT', 580, y);
        doc.text('CGST', 630, y);
        doc.text('SGST', 680, y);
        
        y += lineHeight;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 5;
        
        doc.font('Helvetica');

        // === LOOP ROWS ===
        let totalAmount = 0, totalWeight = 0, totalNos = 0;
        let totalSGST = 0, totalCGST = 0;

        bookings.forEach((b, index) => {
            const bookingDate = formatDate(b.bookingDate);
            const senderParty = truncateText(b.senderName, 18) || 'MADI KURUFFENHAMPT, [ ]';
            const receiverParty = truncateText(b.receiverName, 18) || 'Nazaakat Design Heritage Pvt. Ltd.';
            const podNo = b.items?.[0]?.receiptNo || '35784';
            const weight = b.items?.reduce((sum, i) => sum + (Number(i.weight) || 0), 0) || 1.000;
            const insurance = b.items?.reduce((sum, i) => sum + (Number(i.insurance) || 0), 0) || '';
            const nos = b.items?.length || 1;
            const amount = Number(b.billTotal) || 200.00;
            const gstRate = 9; // Assuming 9% for both CGST and SGST as per sample

            const cgstAmount = (gstRate / 100) * amount;
            const sgstAmount = (gstRate / 100) * amount;

            doc.text((index + 1).toString(), 50, y);
            doc.text(bookingDate, 90, y);
            doc.text(podNo, 140, y);
            doc.text(senderParty, 200, y);
            doc.text(receiverParty, 340, y);
            doc.text(nos.toString(), 470, y);
            doc.text(weight.toFixed(3), 500, y);
            doc.text(insurance ? insurance.toFixed(2) : '', 550, y);
            doc.text(amount.toFixed(2), 580, y);
            doc.text(`${gstRate}%`, 630, y);
            doc.text(cgstAmount.toFixed(2), 630, y + 15);
            doc.text(`${gstRate}%`, 680, y);
            doc.text(sgstAmount.toFixed(2), 680, y + 15);

            totalAmount += amount;
            totalWeight += weight;
            totalNos += nos;
            totalCGST += cgstAmount;
            totalSGST += sgstAmount;
            
            y += 30; // Increased line height for GST rows
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 5;
        });

        // === FOOTER TOTALS ===
        doc.font('Helvetica-Bold');
        doc.text('Total', 470, y);
        doc.text(totalNos.toString(), 470, y, { width: 30, align: 'right' });
        doc.text(totalWeight.toFixed(3), 500, y, { width: 50, align: 'right' });
        doc.text('', 550, y);
        doc.text(totalAmount.toFixed(2), 580, y, { width: 50, align: 'right' });
        doc.text(totalCGST.toFixed(2), 630, y, { width: 50, align: 'right' });
        doc.text(totalSGST.toFixed(2), 680, y, { width: 50, align: 'right' });
        
        y += lineHeight;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        // === SUMMARY SECTION ===
        doc.text(`AMOUNT TOTAL`, 450, y);
        doc.text(totalAmount.toFixed(2), 550, y, { width: 50, align: 'right' });
        y += lineHeight;
        
        doc.text(`(+) CGST 9%`, 450, y);
        doc.text(totalCGST.toFixed(2), 550, y, { width: 50, align: 'right' });
        y += lineHeight;
        
        doc.text(`(+) SGST 9%`, 450, y);
        doc.text(totalSGST.toFixed(2), 550, y, { width: 50, align: 'right' });
        y += lineHeight;
        
        doc.text(`Round off`, 450, y);
        const roundOff = Math.round((totalAmount + totalCGST + totalSGST) * 100) / 100 - (totalAmount + totalCGST + totalSGST);
        doc.text(roundOff.toFixed(2), 550, y, { width: 50, align: 'right' });
        y += lineHeight;
        
        const grandTotal = totalAmount + totalCGST + totalSGST + roundOff;
        doc.text(`GRAND TOTAL`, 450, y);
        doc.text(grandTotal.toFixed(2), 550, y, { width: 50, align: 'right' });
        y += lineHeight + 10;

        // Amount in words
        doc.text(`AMOUNT IN WORDS :- INR ${convertNumberToWords(grandTotal)} Only.`, 50, y);
        y += lineHeight + 20;

        // Footer
        doc.text('For Bharat Parcel Services Pvt.Ltd.', { align: 'right' });
        y += lineHeight;
        doc.text('DIRECTOR', { align: 'right' });

        doc.end();
    });
};

// --- Helper functions ---
function formatDate(date) {
    if (!date) return '15-6-2025'; // Default date for sample
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

function convertNumberToWords(num) {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
        if ((n = n.toString()).length > 9) return 'Overflow';
        let numStr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!numStr) return; let str = '';
        str += (numStr[1] != 0) ? (a[Number(numStr[1])] || b[numStr[1][0]] + ' ' + a[numStr[1][1]]) + ' Crore ' : '';
        str += (numStr[2] != 0) ? (a[Number(numStr[2])] || b[numStr[2][0]] + ' ' + a[numStr[2][1]]) + ' Lakh ' : '';
        str += (numStr[3] != 0) ? (a[Number(numStr[3])] || b[numStr[3][0]] + ' ' + a[numStr[3][1]]) + ' Thousand ' : '';
        str += (numStr[4] != 0) ? (a[Number(numStr[4])] || b[numStr[4][0]] + ' ' + a[numStr[4][1]]) + ' Hundred ' : '';
        str += (numStr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(numStr[5])] || b[numStr[5][0]] + ' ' + a[numStr[5][1]]) + ' ' : '';
        return str.trim();
    }
    return inWords(Math.floor(num)) + (num % 1 ? ' and ' + Math.round((num % 1) * 100) + '/100' : '');
}