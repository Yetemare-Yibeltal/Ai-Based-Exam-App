const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { errorResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Allowed document MIME types
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// All allowed types combined
const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];

// Maximum file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// Generate unique filename
const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const uniqueSuffix = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${uniqueSuffix}${ext}`;
};

// Memory storage — store in buffer for Cloudinary upload
const memoryStorage = multer.memoryStorage();

// Disk storage — store locally (for temp files)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp/");
  },
  filename: (req, file, cb) => {
    const uniqueName = generateFileName(file.originalname);
    cb(null, uniqueName);
  },
});

// Image file filter
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
};

// Document file filter
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Invalid file type. Only PDF and Word documents are allowed. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
};

// All files filter
const allFileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Invalid file type. Received: ${file.mimetype}`,
      ),
      false,
    );
  }
};

// Avatar upload — single image max 2MB stored in memory
const uploadAvatar = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single("avatar");

// Profile image upload — single image max 5MB stored in memory
const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single("image");

// Question image upload — single image max 5MB stored in memory
const uploadQuestionImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single("questionImage");

// Multiple images upload — max 5 images max 5MB each
const uploadMultipleImages = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 5,
  },
  fileFilter: imageFileFilter,
}).array("images", 5);

// Document upload — single document max 10MB
const uploadDocument = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 1,
  },
  fileFilter: documentFileFilter,
}).single("document");

// Handle multer errors gracefully
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.warn(`Multer upload error: ${err.message}`);

        if (err.code === "LIMIT_FILE_SIZE") {
          return errorResponse(
            res,
            "File size too large. Please upload a smaller file",
            400,
          );
        }

        if (err.code === "LIMIT_FILE_COUNT") {
          return errorResponse(
            res,
            "Too many files. Please upload fewer files at once",
            400,
          );
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return errorResponse(res, err.message, 400);
        }

        return errorResponse(res, "File upload failed. Please try again", 400);
      }

      if (err) {
        logger.error(`Upload error: ${err.message}`);
        return errorResponse(res, err.message || "File upload failed", 400);
      }

      // Log successful upload
      if (req.file) {
        logger.info(
          `File uploaded — Name: ${req.file.originalname} — Size: ${req.file.size} bytes — Type: ${req.file.mimetype} — User: ${req.userId || "guest"}`,
        );
      }

      if (req.files && req.files.length > 0) {
        logger.info(
          `${req.files.length} files uploaded — User: ${req.userId || "guest"}`,
        );
      }

      next();
    });
  };
};

// Validate that a file was actually uploaded
const requireFile = (fieldName = "file") => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return errorResponse(
        res,
        `Please upload a ${fieldName} to continue`,
        400,
      );
    }
    next();
  };
};

// Optional file — continues even if no file uploaded
const optionalFile = (req, res, next) => {
  next();
};

// Get file info from uploaded file
const getFileInfo = (file) => {
  if (!file) return null;

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    sizeKB: (file.size / 1024).toFixed(2),
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    buffer: file.buffer,
    encoding: file.encoding,
  };
};

// Check if file is an image
const isImage = (file) => {
  if (!file) return false;
  return ALLOWED_IMAGE_TYPES.includes(file.mimetype);
};

// Check if file is a document
const isDocument = (file) => {
  if (!file) return false;
  return ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
};

module.exports = {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadProfileImage: handleUpload(uploadProfileImage),
  uploadQuestionImage: handleUpload(uploadQuestionImage),
  uploadMultipleImages: handleUpload(uploadMultipleImages),
  uploadDocument: handleUpload(uploadDocument),
  requireFile,
  optionalFile,
  getFileInfo,
  isImage,
  isDocument,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_AVATAR_SIZE,
};
