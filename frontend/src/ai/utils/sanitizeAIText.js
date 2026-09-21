export const sanitizeAIText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
};

export const sanitizeHTML = (text) => {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

export const truncateResponse = (text, maxLength = 1000) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSentence = truncated.lastIndexOf(".");
  return lastSentence > maxLength * 0.7
    ? `${truncated.slice(0, lastSentence + 1)}`
    : `${truncated}...`;
};

export const formatAIMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />")
    .replace(/• /g, "&#8226; ");
};

export const extractKeyPoints = (text) => {
  if (!text) return [];
  const bulletRegex = /[•\-\*]\s+(.+)/g;
  const matches = [];
  let match;
  while ((match = bulletRegex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  return matches.length > 0
    ? matches
    : text
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 5);
};

export const isValidAIResponse = (data) => {
  if (!data) return false;
  if (typeof data === "string") return data.trim().length > 10;
  if (typeof data === "object") return Object.keys(data).length > 0;
  return false;
};
