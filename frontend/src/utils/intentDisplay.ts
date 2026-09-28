import { categoryFromLabel, getCategoryLabel } from "./category";

export const intentLabels: Record<string, string> = {
  recommend: "商品推荐",
  handoff: "人工转接",
  shopping_guidance: "导购咨询"
};

export const nextActionLabels: Record<string, string> = {
  compare: "查看对比",
  ask_followup: "补充需求",
  ask_follow_up: "补充需求",
  view_product: "查看商品",
  handoff: "转人工",
  recommend: "继续推荐"
};

export const slotLabels: Record<string, string> = {
  budget_max: "预算上限",
  budget_min: "预算下限",
  budget: "预算",
  category: "品类",
  brand: "品牌",
  uses: "用途",
  usage: "用途",
  recipient: "送礼对象",
  keywords: "需求关键词",
  confidence: "匹配度"
};

export const isEmptySlotValue = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

export const formatSlotLabel = (key: string) => slotLabels[key] ?? key;

export const formatIntentLabel = (intent: string) => intentLabels[intent] ?? intent;

export const formatNextActionLabel = (action: string) => nextActionLabels[action] ?? action;

export const formatSlotValue = (key: string, value: unknown) => {
  if (key === "category" && typeof value === "string") {
    return getCategoryLabel(categoryFromLabel(value) ?? null);
  }
  if (Array.isArray(value)) return value.join("、");
  return String(value);
};
