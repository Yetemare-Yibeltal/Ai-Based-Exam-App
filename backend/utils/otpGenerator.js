const crypto = require("crypto");

// Generate 6 digit numeric OTP
const generateNumericOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate 8 character alphanumeric OTP
const generateAlphanumericOTP = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += chars[randomBytes[i] % chars.length];
  }
  return otp;
};

// Generate cryptographically secure numeric OTP
const generateSecureNumericOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const range = max - min + 1;
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  return (min + (randomNumber % range)).toString();
};

// Generate OTP with expiry time
const generateOTPWithExpiry = (expiryMinutes = 10) => {
  const otp = generateSecureNumericOTP(6);
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    otp,
    expiresAt,
    expiryMinutes,
  };
};

// Hash OTP for safe storage in database
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp.toString()).digest("hex");
};

// Verify OTP against stored hash
const verifyOTP = (inputOTP, storedHash) => {
  if (!inputOTP || !storedHash) return false;
  const inputHash = hashOTP(inputOTP.toString());
  return crypto.timingSafeEqual(
    Buffer.from(inputHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
};

// Check if OTP has expired
const isOTPExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
};

// Generate OTP for email verification
const generateEmailVerificationOTP = () => {
  return generateOTPWithExpiry(24 * 60); // 24 hours
};

// Generate OTP for password reset
const generatePasswordResetOTP = () => {
  return generateOTPWithExpiry(15); // 15 minutes
};

// Generate OTP for two factor authentication
const generateTwoFactorOTP = () => {
  return generateOTPWithExpiry(5); // 5 minutes
};

// Generate token for email verification link
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash verification token for database storage
const hashVerificationToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Get remaining time in minutes for OTP
const getOTPRemainingTime = (expiresAt) => {
  if (!expiresAt) return 0;
  const remaining = new Date(expiresAt) - new Date();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (60 * 1000));
};

// Format OTP for display (add space in middle for readability)
const formatOTPForDisplay = (otp) => {
  if (!otp || otp.length !== 6) return otp;
  return `${otp.slice(0, 3)} ${otp.slice(3)}`;
};

module.exports = {
  generateNumericOTP,
  generateAlphanumericOTP,
  generateSecureNumericOTP,
  generateOTPWithExpiry,
  hashOTP,
  verifyOTP,
  isOTPExpired,
  generateEmailVerificationOTP,
  generatePasswordResetOTP,
  generateTwoFactorOTP,
  generateVerificationToken,
  hashVerificationToken,
  getOTPRemainingTime,
  formatOTPForDisplay,
};
