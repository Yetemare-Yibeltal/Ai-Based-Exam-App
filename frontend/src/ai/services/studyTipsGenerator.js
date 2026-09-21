import aiClient from "../client";
import { parseStudyTips } from "../utils/parseAIResponse";
import { isValidAIResponse } from "../utils/validateAIOutput";

export const generatePersonalizedStudyTips = async () => {
  const result = await aiClient.getStudyTips();
  if (!result.success) return result;

  const parsed = parseStudyTips(result.data);
  if (!isValidAIResponse(parsed)) {
    return { success: false, error: "Invalid study tips response from AI" };
  }

  return { success: true, data: parsed };
};

export const generateSubjectStudyTips = async (subject) => {
  if (!subject) return { success: false, error: "Subject is required" };
  const result = await aiClient.getSubjectTips(subject);
  if (!result.success) return result;
  return { success: true, data: result.data };
};

export const generateExamTips = async () => {
  const result = await aiClient.getExamTips();
  if (!result.success) return result;
  return { success: true, data: result.data };
};

export const generateTimeManagementTips = async () => {
  const result = await aiClient.getTimeManagementTips();
  if (!result.success) return result;
  return { success: true, data: result.data };
};

export const generatePersonalizedPlan = async (params = {}) => {
  const result = await aiClient.getPersonalizedPlan(params);
  if (!result.success) return result;
  return { success: true, data: result.data };
};
