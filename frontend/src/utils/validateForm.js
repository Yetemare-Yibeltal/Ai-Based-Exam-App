export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(email))
    return "Please enter a valid email address";
  if (email.length > 100) return "Email must not exceed 100 characters";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must not exceed 128 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  if (name.trim().length > 50) return "Name must not exceed 50 characters";
  if (!/^[a-zA-Z\u1200-\u137F\s\-']+$/.test(name)) {
    return "Name can only contain letters, spaces, hyphens and apostrophes";
  }
  return null;
};

export const validateOTP = (otp) => {
  if (!otp) return "OTP code is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be exactly 6 digits";
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone))
    return "Please enter a valid phone number";
  return null;
};

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, min, fieldName = "This field") => {
  if (!value) return null;
  if (value.trim().length < min)
    return `${fieldName} must be at least ${min} characters`;
  return null;
};

export const validateMaxLength = (value, max, fieldName = "This field") => {
  if (!value) return null;
  if (value.trim().length > max)
    return `${fieldName} must not exceed ${max} characters`;
  return null;
};

export const validateUrl = (url) => {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return "Please enter a valid URL";
  }
};

export const validateRegisterForm = (data) => {
  const errors = {};
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  const confirmError = validateConfirmPassword(
    data.password,
    data.confirmPassword,
  );
  if (confirmError) errors.confirmPassword = confirmError;
  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateLoginForm = (data) => {
  const errors = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  if (!data.password) errors.password = "Password is required";
  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateQuestionForm = (data) => {
  const errors = {};
  if (!data.questionText || data.questionText.trim().length < 10) {
    errors.questionText = "Question text must be at least 10 characters";
  }
  if (!data.options || data.options.length !== 4) {
    errors.options = "Question must have exactly 4 options";
  } else {
    data.options.forEach((opt, i) => {
      if (!opt || !opt.trim())
        errors[`option_${i}`] =
          `Option ${String.fromCharCode(65 + i)} is required`;
    });
  }
  if (data.correctAnswer === undefined || data.correctAnswer === null) {
    errors.correctAnswer = "Please select the correct answer";
  }
  if (!data.subject) errors.subject = "Subject is required";
  return { errors, isValid: Object.keys(errors).length === 0 };
};
