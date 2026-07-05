const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate JWT access token
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
      issuer: "heroy-app",
      audience: "heroy-users",
    },
  );
};

// Generate JWT refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      tokenVersion: payload.tokenVersion || 0,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
      issuer: "heroy-app",
      audience: "heroy-users",
    },
  );
};

// Generate both access and refresh tokens
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "heroy-app",
      audience: "heroy-users",
    });
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, expired: true, error: "Token has expired" };
    }
    if (error.name === "JsonWebTokenError") {
      return { valid: false, expired: false, error: "Invalid token" };
    }
    return { valid: false, expired: false, error: error.message };
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: "heroy-app",
      audience: "heroy-users",
    });
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        valid: false,
        expired: true,
        error: "Refresh token has expired",
      };
    }
    if (error.name === "JsonWebTokenError") {
      return { valid: false, expired: false, error: "Invalid refresh token" };
    }
    return { valid: false, expired: false, error: error.message };
  }
};

// Decode token without verifying (for reading expired tokens)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

// Generate random token for email verification and password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate random token hash for storing in database
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate OTP (6 digit number)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get token expiry date
const getTokenExpiry = (expiresIn = "7d") => {
  const ms = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  if (ms[unit]) {
    return new Date(Date.now() + value * ms[unit]);
  }

  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

// Extract token from request header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

// Check if token is about to expire (within 1 hour)
const isTokenAboutToExpire = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;
    return decoded.exp < oneHourFromNow;
  } catch (error) {
    return true;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  generateRandomToken,
  hashToken,
  generateOTP,
  getTokenExpiry,
  extractTokenFromHeader,
  isTokenAboutToExpire,
};
