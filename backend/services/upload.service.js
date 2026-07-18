const cloudinary = require("cloudinary").v2;
const logger = require("../utils/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDERS = {
  STUDENT_AVATARS: "heroy/avatars/students",
  TEACHER_AVATARS: "heroy/avatars/teachers",
  ADMIN_AVATARS: "heroy/avatars/admins",
  QUESTION_IMAGES: "heroy/questions",
  DOCUMENTS: "heroy/documents",
};

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

const uploadImage = async (fileBuffer, mimeType, folder, options = {}) => {
  try {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new Error(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }

    const base64 = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

    const uploadOptions = {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [
        { quality: "auto", fetch_format: "auto" },
        ...(options.width || options.height
          ? [
              {
                width: options.width || 800,
                height: options.height || 800,
                crop: "limit",
              },
            ]
          : []),
      ],
      ...options,
    };

    const result = await cloudinary.uploader.upload(base64, uploadOptions);

    logger.info(
      `Image uploaded — Folder: ${folder} — PublicId: ${result.public_id}`,
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    logger.error(
      `Image upload failed — Folder: ${folder} — Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

const uploadAvatar = async (fileBuffer, mimeType, role = "student") => {
  if (fileBuffer.length > MAX_AVATAR_SIZE) {
    throw new Error("Avatar file size must not exceed 2MB");
  }

  const folderMap = {
    student: FOLDERS.STUDENT_AVATARS,
    teacher: FOLDERS.TEACHER_AVATARS,
    admin: FOLDERS.ADMIN_AVATARS,
  };

  const folder = folderMap[role] || FOLDERS.STUDENT_AVATARS;

  return uploadImage(fileBuffer, mimeType, folder, {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "face",
  });
};

const uploadQuestionImage = async (fileBuffer, mimeType) => {
  if (fileBuffer.length > MAX_IMAGE_SIZE) {
    throw new Error("Image file size must not exceed 5MB");
  }

  return uploadImage(fileBuffer, mimeType, FOLDERS.QUESTION_IMAGES, {
    width: 800,
    height: 600,
    crop: "limit",
  });
};

const uploadDocument = async (fileBuffer, mimeType) => {
  try {
    if (!ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
      throw new Error("Only PDF documents are allowed");
    }

    if (fileBuffer.length > MAX_DOCUMENT_SIZE) {
      throw new Error("Document file size must not exceed 10MB");
    }

    const base64 = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: FOLDERS.DOCUMENTS,
      resource_type: "raw",
      allowed_formats: ["pdf"],
    });

    logger.info(`Document uploaded — PublicId: ${result.public_id}`);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    logger.error(`Document upload failed — Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const deleteFile = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return { success: true };

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok" || result.result === "not found") {
      logger.info(`File deleted — PublicId: ${publicId}`);
      return { success: true };
    }

    throw new Error(`Failed to delete file: ${result.result}`);
  } catch (error) {
    logger.error(
      `File deletion failed — PublicId: ${publicId} — Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

const deleteMultipleFiles = async (publicIds, resourceType = "image") => {
  try {
    if (!publicIds || publicIds.length === 0)
      return { success: true, deleted: 0 };

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    const deleted = Object.values(result.deleted).filter(
      (v) => v === "deleted",
    ).length;

    logger.info(`Multiple files deleted — Count: ${deleted}`);

    return { success: true, deleted, result };
  } catch (error) {
    logger.error(`Multiple file deletion failed — Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    logger.error(
      `Failed to get file info — PublicId: ${publicId} — Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

const generateSignedUrl = (publicId, expiresIn = 3600) => {
  try {
    const timestamp = Math.round(Date.now() / 1000) + expiresIn;
    const signature = cloudinary.utils.api_sign_request(
      { public_id: publicId, timestamp },
      process.env.CLOUDINARY_API_SECRET,
    );

    return {
      success: true,
      url: cloudinary.url(publicId, {
        sign_url: true,
        type: "authenticated",
        expiration: timestamp,
      }),
    };
  } catch (error) {
    logger.error(`Failed to generate signed URL — Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const getFolderContents = async (folder) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results: 100,
    });

    return {
      success: true,
      resources: result.resources,
      total: result.resources.length,
    };
  } catch (error) {
    logger.error(
      `Failed to get folder contents — Folder: ${folder} — Error: ${error.message}`,
    );
    return { success: false, error: error.message };
  }
};

const processFileFromRequest = (file) => {
  if (!file) return null;

  return {
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    size: file.size,
    sizeKB: (file.size / 1024).toFixed(2),
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
  };
};

const validateImageFile = (file) => {
  if (!file) throw new Error("No file provided");
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("File size must not exceed 5MB");
  }
  return true;
};

const validateAvatarFile = (file) => {
  if (!file) throw new Error("No file provided");
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    );
  }
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Avatar file size must not exceed 2MB");
  }
  return true;
};

module.exports = {
  uploadImage,
  uploadAvatar,
  uploadQuestionImage,
  uploadDocument,
  deleteFile,
  deleteMultipleFiles,
  getFileInfo,
  generateSignedUrl,
  getFolderContents,
  processFileFromRequest,
  validateImageFile,
  validateAvatarFile,
  FOLDERS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_AVATAR_SIZE,
  MAX_DOCUMENT_SIZE,
};
