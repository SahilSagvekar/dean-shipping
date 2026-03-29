/**
 * Email Templates for Dean's Shipping Ltd
 */

interface InvoiceItem {
  description: string;
  quantity: number;
  total: number;
}

interface InvoiceData {
  invoiceNo: string;
  customerName: string;
  totalAmount: number;
  subtotal: number;
  vatAmount: number;
  items: InvoiceItem[];
  fromLocation: string;
  toLocation: string;
  bookingType: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function getInvoiceEmailTemplate(data: InvoiceData, isReminder = false) {
  const {
    invoiceNo,
    customerName,
    totalAmount,
    items,
    fromLocation,
    toLocation,
    bookingType
  } = data;

  const subject = isReminder 
    ? `Action Required: Payment Reminder for Invoice #${invoiceNo}`
    : `Your Invoice from Dean's Shipping Ltd - #${invoiceNo}`;

  const title = isReminder ? 'Payment Reminder' : 'Invoice Details';
  const intro = isReminder
    ? `This is a friendly reminder that payment for your recent ${bookingType.toLowerCase()} is outstanding.`
    : `Thank you for choosing Dean's Shipping Ltd. Please find the details of your ${bookingType.toLowerCase()} below.`;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const payUrl = `${SITE_URL}/paynow?invoiceNo=${invoiceNo}`;

  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
          .header { background-color: #296341; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; }
          .button { display: inline-block; padding: 12px 25px; background-color: #296341; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
          .invoice-box { background-color: #f4faf7; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .total-row { font-weight: bold; font-size: 18px; color: #296341; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">DEAN'S SHIPPING LTD</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">Freight & Logistics Services</p>
          </div>
          <div class="content">
            <h2>Hello ${customerName},</h2>
            <p>${intro}</p>
            
            <div class="invoice-box">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Invoice #:</strong> ${invoiceNo}
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>Route:</strong> ${fromLocation} &rarr; ${toLocation}
              </div>
              <div style="display: flex; justify-content: space-between;">
                <strong>Status:</strong> <span style="color: #ff4747; font-weight: bold;">UNPAID</span>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 10px; text-align: left;">Description</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 10px; text-align: right;" class="total-row">$${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: center; margin-top: 30px;">
              <p>You can pay your invoice online securely using our payment portal:</p>
              <a href="${payUrl}" class="button">Pay Invoice Now</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Dean's Shipping Ltd. All rights reserved.</p>
            <p>123 Harbor Drive, Nassau, Bahamas | info@deansshipping.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}
