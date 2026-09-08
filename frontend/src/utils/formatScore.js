export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${parseFloat(value).toFixed(decimals)}%`;
};

export const getGradeFromPercentage = (percentage) => {
  if (percentage >= 95) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 75) return "B+";
  if (percentage >= 65) return "B";
  if (percentage >= 55) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

export const getGradeColor = (grade) => {
  const colors = {
    "A+": "text-emerald-600 bg-emerald-100",
    A: "text-green-600 bg-green-100",
    "B+": "text-blue-600 bg-blue-100",
    B: "text-blue-500 bg-blue-50",
    "C+": "text-yellow-600 bg-yellow-100",
    C: "text-yellow-500 bg-yellow-50",
    D: "text-orange-600 bg-orange-100",
    F: "text-red-600 bg-red-100",
  };
  return colors[grade] || "text-gray-600 bg-gray-100";
};

export const getPerformanceLevel = (percentage) => {
  if (percentage >= 90)
    return {
      label: "Excellent",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    };
  if (percentage >= 75)
    return { label: "Good", color: "text-green-600", bg: "bg-green-100" };
  if (percentage >= 60)
    return { label: "Average", color: "text-yellow-600", bg: "bg-yellow-100" };
  if (percentage >= 50)
    return {
      label: "Below Average",
      color: "text-orange-600",
      bg: "bg-orange-100",
    };
  return { label: "Poor", color: "text-red-600", bg: "bg-red-100" };
};

export const getScoreColor = (percentage) => {
  if (percentage >= 90) return "#22c55e";
  if (percentage >= 75) return "#3b82f6";
  if (percentage >= 60) return "#f59e0b";
  if (percentage >= 50) return "#f97316";
  return "#ef4444";
};

export const getScoreBarColor = (percentage) => {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 60) return "bg-yellow-500";
  if (percentage >= 50) return "bg-orange-500";
  return "bg-red-500";
};

export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const formatTimeDetailed = (seconds) => {
  if (!seconds || seconds < 0) return "0 seconds";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

export const formatScore = (correct, total) => {
  if (!total || total === 0) return "0/0";
  return `${correct}/${total}`;
};

export const calculateAccuracy = (correct, total) => {
  if (!total || total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getRankBadgeClass = (rank) => {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-other";
};

export const getRankEmoji = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

export const isPassingScore = (percentage) => percentage >= 50;
export const isPerfectScore = (percentage) => percentage === 100;

export const getScoreTrend = (scores) => {
  if (!scores || scores.length < 2) return "stable";
  const recent = scores.slice(-3);
  const older = scores.slice(-6, -3);
  if (older.length === 0) return "stable";
  const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
  const olderAvg = older.reduce((sum, s) => sum + s, 0) / older.length;
  if (recentAvg > olderAvg + 5) return "improving";
  if (recentAvg < olderAvg - 5) return "declining";
  return "stable";
};

export const getTrendIcon = (trend) => {
  if (trend === "improving") return "📈";
  if (trend === "declining") return "📉";
  return "➡️";
};

export const getTrendColor = (trend) => {
  if (trend === "improving") return "text-green-600";
  if (trend === "declining") return "text-red-600";
  return "text-gray-500";
};
