import PDFDocument from 'pdfkit';

export const generateInvoicePDF = async (customer, bookings) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const lineHeight = 20;
        let y = 80;

        // Current Date
        const today = new Date();
        const dateOfBill = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        // Header
        doc.fontSize(16).text('TAX INVOICE', { align: 'center' });
        y += 30;
        doc.fontSize(12);
        doc.text('Bharat Parcel Services Pvt.Ltd.', 50, y); y += lineHeight;
        doc.text('332, Kucha Ghasi Ram, Chandni Chowk, Fatehpuri, Delhi -110006', 50, y); y += lineHeight;
        doc.text('GSTIN: 07AAECB6506F1ZY    PAN: AAECB6506F    SAC CODE: 9968', 50, y); y += lineHeight + 10;

        // Customer Info
        const fullName = `${customer.firstName || ''}${customer.middleName || ''}${customer.lastName || ''}`.trim();
        const partyAddress = (customer.senderLocality || customer.address || 'N/A').replace(/\r?\n/g, ', ');
        const senderState = customer.state || 'N/A';
        const senderGst = customer.gstNumber || 'N/A';

        doc.text(`Party Name: ${fullName}`, 50, y); y += lineHeight;
        doc.text(`Party Address: ${partyAddress}`, 50, y); y += lineHeight;
        doc.text(`Sender State: ${senderState}`, 50, y); y += lineHeight;
        doc.text(`Sender GSTIN: ${senderGst}`, 50, y); y += lineHeight;
        doc.text(`Date of Bill: ${dateOfBill}`, 50, y); y += lineHeight + 10;

        // Table Header
        doc.font('Helvetica-Bold');
        doc.text('SR', 50, y)
            .text('Date', 80, y)
            .text('Receiver', 150, y)
            .text('Ref No', 280, y)
            .text('No.', 340, y)
            .text('Weight', 380, y)
            .text('Ins.', 440, y)
            .text('Amount', 480, y)
            .text('IGST', 540, y); // Only show IGST
        y += lineHeight;
        doc.font('Helvetica');

        let totalAmount = 0, totalIGST = 0, totalWeight = 0, totalIns = 0, totalNos = 0;

        bookings.forEach((b, index) => {
            const bookingDate = formatDate(b.bookingDate);
            const receiverName = truncateText(b.receiverName, 22);
            const refNo = b.items?.[0]?.refNo || 'N/A';
            const weight = b.items?.reduce((sum, i) => sum + (Number(i.weight) || 0), 0);
            const insurance = b.items?.reduce((sum, i) => sum + (Number(i.insurance) || 0), 0);
            const nos = b.items?.length || 0;

            const igstPercentage = Number(b.igst) || 0;
            const amount = Number(b.billTotal) || 0;
            const igst = (igstPercentage / 100) * amount;


            if (y > 700) {
                doc.addPage();
                y = 80;
            }

            doc.text(index + 1, 50, y)
                .text(bookingDate, 80, y)
                .text(receiverName, 150, y, { width: 120, ellipsis: true })
                .text(refNo, 280, y)
                .text(nos, 340, y)
                .text(weight.toFixed(2), 380, y)
                .text(insurance.toFixed(2), 440, y)
                .text(amount.toFixed(2), 480, y)
                .text(igst.toFixed(2), 540, y);

            y += lineHeight;

            totalAmount += amount;
            totalIGST += igst;
            totalWeight += weight;
            totalIns += insurance;
            totalNos += nos;
        });

        const grandTotal = totalAmount + totalIGST;

        // Totals
        doc.font('Helvetica-Bold');
        y += 10;
        doc.text('TOTAL', 150, y)
            .text(totalNos, 340, y)
            .text(totalWeight.toFixed(2), 380, y)
            .text(totalIns.toFixed(2), 440, y)
            .text(totalAmount.toFixed(2), 480, y)
            .text(totalIGST.toFixed(2), 540, y);

        // Grand Total
        y += lineHeight + 10;
        doc.text(`GRAND TOTAL: ₹${grandTotal.toFixed(2)}`, 400, y);

        // Amount in Words
        y += lineHeight;
        doc.font('Helvetica').text(`Amount in Words: ${convertNumberToWords(grandTotal)} only`, 50, y);

        // Footer
        y += 2 * lineHeight;
        doc.text('For Bharat Parcel Services Pvt.Ltd.', { align: 'right' });
        doc.text('DIRECTOR', { align: 'right' });

        doc.end();
    });
};

// --- Helper functions ---
function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
}

function truncateText(text, maxLength) {
    return text?.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

function convertNumberToWords(n) {
    const num = Number(n);
    if (isNaN(num)) return 'INVALID AMOUNT';
    return `INR ${num.toFixed(2)}`;
}