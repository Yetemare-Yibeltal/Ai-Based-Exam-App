const crypto = require("crypto");
const {
  hashVerificationToken,
  generateVerificationToken,
} = require("./otpGenerator");

// Generate password reset token and its hash
const generatePasswordResetToken = () => {
  const resetToken = generateVerificationToken();
  const resetTokenHash = hashVerificationToken(resetToken);
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return {
    resetToken, // Send this to user via email (plain)
    resetTokenHash, // Store this in database (hashed)
    resetTokenExpiry, // Store this in database
  };
};

// Verify password reset token against stored hash
const verifyPasswordResetToken = (inputToken, storedHash, expiresAt) => {
  // Check if token exists
  if (!inputToken || !storedHash || !expiresAt) {
    return {
      valid: false,
      message: "Invalid or missing reset token",
    };
  }

  // Check if token has expired
  if (new Date() > new Date(expiresAt)) {
    return {
      valid: false,
      message: "Password reset token has expired. Please request a new one",
    };
  }

  // Hash the input token and compare with stored hash
  const inputTokenHash = hashVerificationToken(inputToken);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(inputTokenHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );

  if (!isValid) {
    return {
      valid: false,
      message: "Invalid reset token. Please request a new one",
    };
  }

  return {
    valid: true,
    message: "Token is valid",
  };
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    return {
      valid: false,
      errors: ["Password is required"],
      strength: "none",
    };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Check for common weak passwords
  const commonPasswords = [
    "password",
    "password123",
    "12345678",
    "qwerty123",
    "admin123",
    "letmein",
    "welcome1",
    "monkey123",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a stronger password");
  }

  // Calculate password strength
  let strength = "weak";
  if (errors.length === 0) {
    const score =
      (password.length >= 12 ? 1 : 0) +
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[a-z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 1 : 0) +
      (password.length >= 16 ? 1 : 0);

    if (score >= 6) strength = "very strong";
    else if (score >= 5) strength = "strong";
    else if (score >= 4) strength = "medium";
    else strength = "weak";
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
};

// Check if new password is same as old password
const isSamePassword = async (newPassword, hashedOldPassword) => {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(newPassword, hashedOldPassword);
};

// Generate temporary password for admin reset
const generateTemporaryPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  const all = uppercase + lowercase + numbers + special;

  let password = "";

  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining characters randomly
  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle password characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// Generate password reset email link
const generatePasswordResetLink = (token, baseUrl) => {
  const frontendUrl =
    baseUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/reset-password?token=${token}`;
};

// Generate email verification link
const generateEmailVerificationLink = (token, baseUrl) => {
  const frontendUrl =
    baseUrl || process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/verify-email?token=${token}`;
};

// Check if reset token is about to expire (less than 5 minutes remaining)
const isTokenAboutToExpire = (expiresAt, thresholdMinutes = 5) => {
  if (!expiresAt) return true;
  const threshold = thresholdMinutes * 60 * 1000;
  return new Date(expiresAt) - new Date() < threshold;
};

// Get remaining time for reset token in minutes
const getTokenRemainingMinutes = (expiresAt) => {
  if (!expiresAt) return 0;
  const remaining = new Date(expiresAt) - new Date();
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (60 * 1000));
};

module.exports = {
  generatePasswordResetToken,
  verifyPasswordResetToken,
  validatePasswordStrength,
  isSamePassword,
  generateTemporaryPassword,
  generatePasswordResetLink,
  generateEmailVerificationLink,
  isTokenAboutToExpire,
  getTokenRemainingMinutes,
};
