import { api } from "./authService";

export type TeachingRuleType = "TEACHER_GENERAL" | "TEACHER_LESSON";

export interface TeachingRule {
  id: number;
  rule_type: TeachingRuleType;
  lesson_id: string | null;
  content: string;
  is_active: boolean;
  merged_from: number[] | null;
  created_at: string;
}

export const getMyTeachingRules = async (): Promise<TeachingRule[]> => {
  const { data } = await api.get<TeachingRule[]>("/teaching-rules/my");
  return data;
};

export const updateTeachingRule = async (
  ruleId: number,
  content: string,
): Promise<void> => {
  await api.put(`/teaching-rules/${ruleId}`, { content });
};

export const deleteTeachingRule = async (ruleId: number): Promise<void> => {
  await api.delete(`/teaching-rules/${ruleId}`);
};
