export const SUBJECT_BG_COLORS = {
  math: "bg-blue-900",
  english: "bg-green-800",
  biology: "bg-cyan-700",
  chemistry: "bg-orange-700",
  physics: "bg-purple-800",
  civics: "bg-red-800",
};

export const SUBJECT_TEXT_COLORS = {
  math: "text-blue-900",
  english: "text-green-800",
  biology: "text-cyan-700",
  chemistry: "text-orange-700",
  physics: "text-purple-800",
  civics: "text-red-800",
};

export const SUBJECT_LIGHT_BG = {
  math: "bg-blue-50",
  english: "bg-green-50",
  biology: "bg-cyan-50",
  chemistry: "bg-orange-50",
  physics: "bg-purple-50",
  civics: "bg-red-50",
};

export const SUBJECT_BORDER_COLORS = {
  math: "border-blue-900",
  english: "border-green-800",
  biology: "border-cyan-700",
  chemistry: "border-orange-700",
  physics: "border-purple-800",
  civics: "border-red-800",
};

export const SUBJECT_HEX_COLORS = {
  math: "#1B3A6B",
  english: "#2E7D32",
  biology: "#00838F",
  chemistry: "#E65100",
  physics: "#6A1B9A",
  civics: "#B71C1C",
};

export const SUBJECT_GRADIENTS = {
  math: "from-blue-900 to-blue-700",
  english: "from-green-800 to-green-600",
  biology: "from-cyan-700 to-teal-600",
  chemistry: "from-orange-700 to-amber-600",
  physics: "from-purple-800 to-violet-700",
  civics: "from-red-800 to-red-700",
};

export const getSubjectBgClass = (subject) =>
  SUBJECT_BG_COLORS[subject] || "bg-gray-700";
export const getSubjectTextClass = (subject) =>
  SUBJECT_TEXT_COLORS[subject] || "text-gray-700";
export const getSubjectLightBg = (subject) =>
  SUBJECT_LIGHT_BG[subject] || "bg-gray-50";
export const getSubjectBorderClass = (subject) =>
  SUBJECT_BORDER_COLORS[subject] || "border-gray-300";
export const getSubjectHexColor = (subject) =>
  SUBJECT_HEX_COLORS[subject] || "#1B3A6B";
export const getSubjectGradient = (subject) =>
  SUBJECT_GRADIENTS[subject] || "from-gray-700 to-gray-600";

export const getSubjectBadgeClass = (subject) =>
  `${getSubjectBgClass(subject)} text-white`;

export const CHART_COLORS = [
  "#1B3A6B",
  "#2E7D32",
  "#00838F",
  "#E65100",
  "#6A1B9A",
  "#B71C1C",
];

export const getChartColor = (index) =>
  CHART_COLORS[index % CHART_COLORS.length];
