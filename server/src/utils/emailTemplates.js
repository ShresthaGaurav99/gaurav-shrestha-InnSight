const getOTPTemplate = (otp, purpose = 'Verification') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
            .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; }
            .content { padding: 40px; line-height: 1.6; color: #333; }
            .otp-container { background-color: #f8f9fa; border: 1px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
            .footer { background-color: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>INNSIGHT</h1>
            </div>
            <div class="content">
                <h2>${purpose} OTP</h2>
                <p>Hello,</p>
                <p>You have requested a verification code for your InnSight account. Please use the following One-Time Password (OTP) to proceed:</p>
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                </div>
                <p>This code is valid for <b>10 minutes</b>. If you did not request this, please ignore this email.</p>
                <p>Best Regards,<br>The InnSight Team</p>
            </div>
            <div class="footer">
                &copy; 2026 InnSight Hotel Management System | Kathmandu, Nepal
            </div>
        </div>
    </body>
    </html>
  `;
};

const getBookingTemplate = (booking) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; }
            .header { background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: #ffffff; padding: 30px; text-align: center; }
            .content { padding: 30px; color: #333; }
            .card { background-color: #fdfdfd; border: 1px solid #f0f0f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #1a1a1a; }
            .footer { background-color: #f4f4f4; color: #888; padding: 20px; text-align: center; font-size: 12px; }
            .status { color: #28a745; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0">INNSIGHT</h1>
                <p style="margin: 5px 0 0 0">Booking Confirmed</p>
            </div>
            <div class="content">
                <h2>Hello ${booking.guestName},</h2>
                <p>Thank you for choosing InnSight. Your stay has been successfully booked. We look forward to welcoming you!</p>
                
                <div class="card">
                    <h3 style="margin-top:0">Reservation Details</h3>
                    <div class="detail-row">
                        <span class="label">Room Number</span>
                        <span class="value">${booking.roomNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-In Date</span>
                        <span class="value">${booking.checkIn}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-Out Date</span>
                        <span class="value">${booking.checkOut}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Total Amount</span>
                        <span class="value">Rs. ${booking.totalAmount}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Status</span>
                        <span class="status">CONFIRMED</span>
                    </div>
                </div>

                <p>If you have any questions, feel free to contact our reception desk at any time.</p>
                <p>See you soon!</p>
            </div>
            <div class="footer">
                &copy; 2026 InnSight Hotel Management | Nepal's Leading Hospitality Tool
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { getOTPTemplate, getBookingTemplate };
