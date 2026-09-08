export const APP_NAME = import.meta.env.VITE_APP_NAME || "HEROY";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const QUIZ_SETTINGS = {
  DEFAULT_QUESTIONS: 20,
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  TIME_PER_QUESTION: 30,
  MIN_QUESTIONS_FOR_SUBJECT: 5,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 180, 365];

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  },
};

export const SUBJECT_COLORS = {
  math: { bg: "#1B3A6B", text: "#ffffff", light: "#dbeafe" },
  english: { bg: "#2E7D32", text: "#ffffff", light: "#dcfce7" },
  biology: { bg: "#00838F", text: "#ffffff", light: "#cffafe" },
  chemistry: { bg: "#E65100", text: "#ffffff", light: "#ffedd5" },
  physics: { bg: "#6A1B9A", text: "#ffffff", light: "#f3e8ff" },
  civics: { bg: "#B71C1C", text: "#ffffff", light: "#fee2e2" },
};

export const GRADE_COLORS = {
  "A+": { bg: "#059669", text: "#ffffff" },
  A: { bg: "#16a34a", text: "#ffffff" },
  "B+": { bg: "#2563eb", text: "#ffffff" },
  B: { bg: "#3b82f6", text: "#ffffff" },
  "C+": { bg: "#d97706", text: "#ffffff" },
  C: { bg: "#f59e0b", text: "#000000" },
  D: { bg: "#ea580c", text: "#ffffff" },
  F: { bg: "#dc2626", text: "#ffffff" },
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const TOAST_DURATION = 4000;
export const DEBOUNCE_DELAY = 300;
export const SEARCH_DELAY = 500;

export const LOCAL_STORAGE_KEYS = {
  THEME: "heroy_theme",
  LANGUAGE: "heroy_language",
  ACCESS_TOKEN: "heroy_access_token",
  REFRESH_TOKEN: "heroy_refresh_token",
  USER: "heroy_user",
};

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "SNNPR",
  "Somali",
  "Tigray",
];

export const EMPTY_STATES = {
  NO_QUESTIONS: {
    icon: "❓",
    title: "No questions yet",
    message: "Start practicing to see questions here",
  },
  NO_SCORES: {
    icon: "📊",
    title: "No scores yet",
    message: "Complete a quiz to see your scores here",
  },
  NO_NOTIFICATIONS: {
    icon: "🔔",
    title: "No notifications",
    message: "You are all caught up!",
  },
  NO_STUDENTS: {
    icon: "👨‍🎓",
    title: "No students found",
    message: "No students match your search criteria",
  },
  NO_TEACHERS: {
    icon: "👨‍🏫",
    title: "No teachers found",
    message: "No teachers match your search criteria",
  },
};
