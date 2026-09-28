export type Category = "phone" | "laptop" | "tablet" | "earphone" | "camera" | "smartwatch";

export type Product = {
  id: string;
  name: string;
  category: Category;
  brand: string;
  price: number | string;
  stock: number;
  tags: string[];
  specs: Record<string, string | number | boolean>;
  selling_points: string[];
  after_sales_policy: string;
  recommendation_reason?: string | null;
  rating?: number;
  sales?: number;
  imageTone?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  error: null | {
    code: string;
    message: string;
  };
  trace_id: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatResponse = {
  reply: string;
  conversation_id: string;
  intent: "recommend" | "compare" | "handoff";
  category: Category | null;
  slots: Record<string, unknown>;
  recommendations: Product[];
  next_action: "compare" | "ask_followup" | "view_product" | "handoff";
};

export type CompareResponse = {
  products: Product[];
  diff_groups: Array<{
    group: string;
    field: string;
    values: Record<string, string | number | boolean | null>;
    decision_weight: "high" | "medium" | "low";
  }>;
  ai_summary: string;
  best_for: Record<string, string>;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type HandoffTicket = {
  ticket_id: string;
  conversation_id?: string | null;
  status: "creating" | "open" | "assigned" | "closed";
  reason: string;
  summary: string;
};

export type HealthData = {
  status: "ok";
  api: "ok";
  database: "ok" | "not_configured";
  redis: "ok" | "not_configured";
  version: string;
  source?: "backend" | "mock";
};

export type RecommendRequest = {
  query: string;
  category?: Category;
  brand?: string;
  budget_min?: number;
  budget_max?: number;
  limit?: number;
};

export type RecommendResponse = {
  intent: "recommend";
  category: Category | null;
  slots: {
    budget_max?: number | null;
    budget_min?: number | null;
    category?: Category | null;
    brand?: string | null;
    excluded_brands?: string[];
    uses?: string[];
    recipient?: string | null;
    keywords?: string;
  };
  recommendations: Product[];
};
