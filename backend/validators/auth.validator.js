const { body, param, query } = require("express-validator");

const passwordRules = () =>
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character");

const newPasswordRules = (field = "newPassword") =>
  body(field)
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character");

const emailRules = (field = "email") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters");

const otpRules = (field = "otp") =>
  body(field)
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers");

const nameRules = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    );

const registerValidator = [
  nameRules(),
  emailRules(),
  passwordRules(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    }),
  body("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),
  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),
];

const loginValidator = [
  emailRules(),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidator = [emailRules()];

const resetPasswordValidator = [
  emailRules(),
  otpRules(),
  newPasswordRules(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error("Passwords do not match");
      return true;
    }),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  newPasswordRules(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error("Passwords do not match");
      return true;
    }),
];

const verifyOTPValidator = [emailRules(), otpRules()];

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),
  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),
  body("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Please provide a valid phone number"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Bio must not exceed 300 characters"),
  body("preferredLanguage")
    .optional()
    .isIn(["en", "am"])
    .withMessage("Language must be en or am"),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyOTPValidator,
  updateProfileValidator,
  emailRules,
  passwordRules,
  newPasswordRules,
  otpRules,
  nameRules,
};
