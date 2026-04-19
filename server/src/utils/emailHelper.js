const nodemailer = require('nodemailer');
const { getOTPTemplate, getBookingTemplate } = require('./emailTemplates');

const hasValue = (value) => Boolean(value && String(value).trim());

const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (hasValue(smtpHost) && hasValue(smtpUser) && hasValue(smtpPass)) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  if (
    hasValue(process.env.EMAIL_USER) &&
    hasValue(process.env.EMAIL_PASS) &&
    process.env.EMAIL_USER !== 'your-email@gmail.com' &&
    process.env.EMAIL_PASS !== 'your-app-password'
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

const sendOTPEmail = async (email, otp, purpose = 'registration') => {
  console.log('\n=========================================');
  console.log(`OTP for ${email}: ${otp}`);
  console.log('=========================================\n');

  const transporter = createTransporter();

  if (!transporter) {
    console.log('[INFO] SMTP is not configured. OTP was logged to the server terminal only.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const fromAddress =
    process.env.FROM_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  const mailOptions = {
    from: `"InnSight Official" <${fromAddress}>`,
    to: email,
    subject: `InnSight ${purpose === 'registration' ? 'Registration' : 'Verification'} OTP`,
    text: `Your InnSight OTP is ${otp}. It expires in 10 minutes.`,
    html: getOTPTemplate(otp, purpose === 'registration' ? 'Registration' : 'Account Verification'),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] OTP email sent to ${email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[ERROR] Failed to send OTP email to ${email}:`, err);
    return { sent: false, reason: 'smtp_send_failed', error: err.message };
  }
};

const sendBookingConfirmation = async (email, bookingData) => {
  const transporter = createTransporter();
  if (!transporter) return { sent: false };

  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const mailOptions = {
    from: `"InnSight Bookings" <${fromAddress}>`,
    to: email,
    subject: 'Booking Confirmed - InnSight Hotel',
    text: `Your booking for Room ${bookingData.roomNumber} is confirmed.`,
    html: getBookingTemplate(bookingData),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Booking confirmation sent to ${email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[ERROR] Failed to send booking email: ${err.message}`);
    return { sent: false };
  }
};

module.exports = { sendOTPEmail, sendBookingConfirmation };
