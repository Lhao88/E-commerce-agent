import type { Category, Product } from "../types";

export const categoryLabels: Record<Category, string> = {
  phone: "手机",
  laptop: "笔记本",
  tablet: "平板",
  earphone: "耳机",
  camera: "相机",
  smartwatch: "智能手表"
};

export const categories = Object.keys(categoryLabels) as Category[];

export const categoryFromLabel = (value?: string | null): Category | undefined => {
  if (!value) return undefined;
  if (value in categoryLabels) return value as Category;
  return Object.entries(categoryLabels).find(([, label]) => label === value)?.[0] as Category | undefined;
};

export const getCategoryLabel = (category?: Product["category"] | null) => {
  if (!category) return "跨品类";
  return categoryLabels[category] ?? category;
};

export const getProductPrice = (product: Product) => Number(product.price);

export const getProductTone = (product: Product) => product.imageTone ?? {
  phone: "#355b7a",
  laptop: "#1f3a5f",
  tablet: "#52647a",
  earphone: "#303a46",
  camera: "#2e3338",
  smartwatch: "#4b604f"
}[product.category];

export const getProductReason = (product: Product) =>
  product.recommendation_reason || product.selling_points.join("、") || "后端返回的推荐候选商品。";
