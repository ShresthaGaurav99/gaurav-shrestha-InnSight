const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendOTPEmail } = require('../utils/emailHelper');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const createTokenPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizeName = (name = '') => name.trim();

const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const createOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MS);

const isValidRole = (role) => ['customer', 'staff', 'manager'].includes(role);

const validateEmail = (email) => EMAIL_REGEX.test(email);

const validatePassword = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  return null;
};

const sendOtpResponse = async (email, otp, purpose) => {
  const emailResult = await sendOTPEmail(email, otp, purpose);

  return {
    message: emailResult.sent
      ? `${purpose === 'password reset' ? 'Password reset' : 'Registration'} OTP sent to your email.`
      : 'SMTP is not configured, so use the OTP printed in the server terminal.',
    email,
  };
};

// 1. Register API
exports.register = async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  const role = req.body.role || 'customer';

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({ message: 'Please select a valid role' });
    }

    const existingUserResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const existingUser = existingUserResult.rows[0];

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = createOtp();
    const otpExpires = createOtpExpiry();

    let user;

    if (existingUser) {
      if (!existingUser.otp && !existingUser.otp_expires) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const updatedUserResult = await db.query(
        `UPDATE users
         SET name = $1,
             password = $2,
             role = $3,
             otp = $4,
             otp_expires = $5,
             "updatedAt" = NOW()
         WHERE email = $6
         RETURNING id, name, email, role`,
        [name, hashedPassword, role, otp, otpExpires, email]
      );

      user = updatedUserResult.rows[0];
    } else {
      const result = await db.query(
        `INSERT INTO users (name, email, password, role, otp, otp_expires, "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, name, email, role`,
        [name, email, hashedPassword, role, otp, otpExpires]
      );

      user = result.rows[0];
    }

    const response = await sendOtpResponse(email, otp, 'registration');

    return res.status(existingUser ? 200 : 201).json({
      ...response,
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 2. Login API
exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (user.otp || user.otp_expires) {
      return res.status(403).json({
        message: 'Please verify your email with the OTP sent during registration before logging in.',
        email,
      });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login successful',
      token,
      user: createTokenPayload(user),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 3. Verify OTP API
exports.verifyOTP = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp_expires) {
      return res.status(400).json({ message: 'No pending verification found for this account' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    await db.query(
      'UPDATE users SET otp = NULL, otp_expires = NULL, "updatedAt" = NOW() WHERE email = $1',
      [email]
    );

    const token = signToken(user);

    return res.json({
      message: 'Email verified successfully',
      token,
      user: createTokenPayload(user),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 4. Resend verification OTP
exports.resendOTP = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp && !user.otp_expires) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    const otp = createOtp();
    const otpExpires = createOtpExpiry();

    await db.query(
      'UPDATE users SET otp = $1, otp_expires = $2, "updatedAt" = NOW() WHERE email = $3',
      [otp, otpExpires, email]
    );

    const response = await sendOtpResponse(email, otp, 'registration');

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 5. Request password reset OTP
exports.requestPasswordReset = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email address' });
    }

    const resetOtp = createOtp();
    const resetOtpExpires = createOtpExpiry();

    await db.query(
      `UPDATE users
       SET reset_otp = $1,
           reset_otp_expires = $2,
           "updatedAt" = NOW()
       WHERE email = $3`,
      [resetOtp, resetOtpExpires, email]
    );

    const response = await sendOtpResponse(email, resetOtp, 'password reset');

    return res.json(response);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 6. Reset password with OTP
exports.resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { otp, password } = req.body;

  try {
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.reset_otp || !user.reset_otp_expires) {
      return res.status(400).json({ message: 'No password reset request found for this account' });
    }

    if (user.reset_otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.reset_otp_expires)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users
       SET password = $1,
           reset_otp = NULL,
           reset_otp_expires = NULL,
           "updatedAt" = NOW()
       WHERE email = $2`,
      [hashedPassword, email]
    );

    return res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 7. Get Logged-in User Info
exports.getMe = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.userId]);
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
