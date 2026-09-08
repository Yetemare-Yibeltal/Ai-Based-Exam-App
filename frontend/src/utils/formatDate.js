import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  differenceInDays,
} from "date-fns";

export const formatDate = (date, pattern = "MMM dd, yyyy") => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(d, pattern);
  } catch {
    return "";
  }
};

export const formatDateTime = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(d, "MMM dd, yyyy HH:mm");
  } catch {
    return "";
  }
};

export const formatTimeAgo = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
    if (isYesterday(d)) return "Yesterday";
    const days = differenceInDays(new Date(), d);
    if (days < 7) return `${days} days ago`;
    return format(d, "MMM dd, yyyy");
  } catch {
    return "";
  }
};

export const formatRelativeDate = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
};

export const formatShortDate = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(d, "dd MMM");
  } catch {
    return "";
  }
};

export const formatMonthYear = (date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return format(d, "MMMM yyyy");
  } catch {
    return "";
  }
};

export const getDaysSince = (date) => {
  if (!date) return 0;
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return differenceInDays(new Date(), d);
  } catch {
    return 0;
  }
};

export const isDateToday = (date) => {
  if (!date) return false;
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    return isToday(d);
  } catch {
    return false;
  }
};

export const formatDuration = (seconds) => {
  if (!seconds) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes} min`;
  return `${seconds}s`;
};

export const getCurrentYear = () => new Date().getFullYear();
export const getCurrentMonth = () => new Date().getMonth() + 1;
export const getCurrentDate = () => format(new Date(), "yyyy-MM-dd");
