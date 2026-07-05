const sanitizeHtml = require("sanitize-html");

// sanitize-html is not installed yet, we use built-in string methods
// Run: npm install sanitize-html  in backend folder

// Remove all HTML tags from string
const stripHtml = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

// Remove special characters except letters, numbers, spaces and basic punctuation
const sanitizeString = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/[<>{}[\]\\\/]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Sanitize email address
const sanitizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.toLowerCase().trim().replace(/\s/g, "");
};

// Sanitize name (only letters, spaces, hyphens, apostrophes)
const sanitizeName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/[^a-zA-Z\u1200-\u137F\s\-']/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Sanitize phone number (only numbers, +, -, spaces, parentheses)
const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[^0-9+\-\s()]/g, "").trim();
};

// Sanitize MongoDB ObjectId
const sanitizeObjectId = (id) => {
  if (!id || typeof id !== "string") return "";
  return id.replace(/[^a-fA-F0-9]/g, "").trim();
};

// Sanitize number input
const sanitizeNumber = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return 0;
  return parsed;
};

// Sanitize integer input
const sanitizeInteger = (num) => {
  const parsed = parseInt(num);
  if (isNaN(parsed)) return 0;
  return parsed;
};

// Sanitize boolean input
const sanitizeBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    return val.toLowerCase() === "true" || val === "1";
  }
  return Boolean(val);
};

// Sanitize URL
const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch (error) {
    return "";
  }
};

// Sanitize search query (remove special regex chars)
const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== "string") return "";
  return query
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
};

// Sanitize pagination params
const sanitizePagination = (page, limit) => {
  const sanitizedPage = Math.max(1, sanitizeInteger(page) || 1);
  const sanitizedLimit = Math.min(
    100,
    Math.max(1, sanitizeInteger(limit) || 10),
  );
  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip: (sanitizedPage - 1) * sanitizedLimit,
  };
};

// Sanitize question text for exam questions
const sanitizeQuestionText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1000);
};

// Sanitize array of strings
const sanitizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item) => typeof item === "string")
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0);
};

// Sanitize entire request body object
const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "number") {
      sanitized[key] = sanitizeNumber(value);
    } else if (typeof value === "boolean") {
      sanitized[key] = sanitizeBoolean(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeStringArray(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Sanitize Amharic and Ethiopian text
const sanitizeEthiopianText = (text) => {
  if (!text || typeof text !== "string") return "";
  // Allow Ethiopic Unicode range (U+1200–U+137F) plus basic Latin
  return text
    .replace(/[^a-zA-Z0-9\u1200-\u137F\s.,!?;:()\-'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Remove duplicate whitespace and normalize text
const normalizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\t/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .trim();
};

// Sanitize file name for uploads
const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== "string") return "";
  return fileName
    .replace(/[^a-zA-Z0-9._\-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase()
    .trim();
};

// Sanitize subject name for exam questions
const sanitizeSubject = (subject) => {
  if (!subject || typeof subject !== "string") return "";
  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];
  const cleaned = subject.toLowerCase().trim();
  return validSubjects.includes(cleaned) ? cleaned : "";
};

// Sanitize difficulty level
const sanitizeDifficulty = (difficulty) => {
  if (!difficulty || typeof difficulty !== "string") return "medium";
  const validDifficulties = ["easy", "medium", "hard"];
  const cleaned = difficulty.toLowerCase().trim();
  return validDifficulties.includes(cleaned) ? cleaned : "medium";
};

// Sanitize role
const sanitizeRole = (role) => {
  if (!role || typeof role !== "string") return "student";
  const validRoles = ["student", "teacher", "admin"];
  const cleaned = role.toLowerCase().trim();
  return validRoles.includes(cleaned) ? cleaned : "student";
};

module.exports = {
  stripHtml,
  sanitizeString,
  sanitizeEmail,
  sanitizeName,
  sanitizePhone,
  sanitizeObjectId,
  sanitizeNumber,
  sanitizeInteger,
  sanitizeBoolean,
  sanitizeUrl,
  sanitizeSearchQuery,
  sanitizePagination,
  sanitizeQuestionText,
  sanitizeStringArray,
  sanitizeBody,
  sanitizeEthiopianText,
  normalizeText,
  sanitizeFileName,
  sanitizeSubject,
  sanitizeDifficulty,
  sanitizeRole,
};
