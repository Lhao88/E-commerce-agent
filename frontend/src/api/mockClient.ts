import { products } from "../data/products";
import type {
  ApiEnvelope,
  Category,
  ChatResponse,
  CompareResponse,
  HandoffTicket,
  HealthData,
  Product,
  RecommendRequest,
  RecommendResponse
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_MODE = import.meta.env.VITE_API_MODE ?? "auto";
const productCache = new Map<string, Product>();

products.forEach((product) => productCache.set(product.id, product));

const delay = (ms = 320) => new Promise((resolve) => window.setTimeout(resolve, ms));
const trace = () => `req_${Math.random().toString(36).slice(2, 10)}`;

const ok = async <T>(data: T, ms?: number): Promise<ApiEnvelope<T>> => {
  await delay(ms);
  return { success: true, data, error: null, trace_id: trace() };
};

const fail = async <T>(code: string, message: string, ms = 260): Promise<ApiEnvelope<T>> => {
  await delay(ms);
  return { success: false, data: null, error: { code, message }, trace_id: trace() };
};

const cacheProducts = (items?: Product[] | null) => {
  items?.forEach((product) => productCache.set(product.id, product));
};

const request = async <T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  return response.json() as Promise<ApiEnvelope<T>>;
};

const canUseBackend = () => API_MODE !== "mock";
const shouldFallback = () => API_MODE !== "backend";

const keywordCategory: Array<[RegExp, Category]> = [
  [/游戏本|笔记本|电脑|办公本|轻薄本/, "laptop"],
  [/手机|拍照|续航|安卓|iPhone/i, "phone"],
  [/平板|网课|手写|学习/, "tablet"],
  [/耳机|降噪|运动耳机|音质/, "earphone"],
  [/相机|微单|拍摄|vlog|摄影/i, "camera"],
  [/手表|运动表|健康|跑步/, "smartwatch"]
];

const parseBudget = (text: string) => {
  const match = text.match(/(\d{3,5})/);
  return match ? Number(match[1]) : undefined;
};

const inferCategory = (text: string): Category | null => keywordCategory.find(([rule]) => rule.test(text))?.[1] ?? null;

const scoreProduct = (product: Product, text: string) => {
  const price = Number(product.price);
  const budget = parseBudget(text);
  let score = 0;
  if (budget && price <= budget) score += 8;
  if (budget && price > budget && price <= budget * 1.15) score += 3;
  product.tags.forEach((tag) => {
    if (text.includes(tag.replace("5000内", ""))) score += 4;
  });
  product.selling_points.forEach((point) => {
    if (text.includes(point.slice(0, 2))) score += 2;
  });
  if (/游戏|性能|3A|电竞/.test(text) && product.tags.some((tag) => /游戏|RTX|性能/.test(tag))) score += 8;
  if (/拍照|影像|人像/.test(text) && product.tags.some((tag) => /拍照|影像|人像/.test(tag))) score += 8;
  if (/运动|跑步/.test(text) && product.tags.some((tag) => /运动|跑步/.test(tag))) score += 8;
  if (/学习|网课|手写/.test(text) && product.tags.some((tag) => /学习|手写/.test(tag))) score += 8;
  if (/长续航|续航/.test(text) && product.tags.some((tag) => /长续航|续航/.test(tag))) score += 5;
  return score + (product.rating ?? 4.6) + (product.sales ?? 600) / 2000;
};

const filterProducts = (params: {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}) => {
  const query = params.q?.trim() ?? "";
  return products
    .filter((product) => !params.category || product.category === params.category)
    .filter((product) => !params.brand || product.brand === params.brand)
    .filter((product) => params.minPrice === undefined || Number(product.price) >= params.minPrice)
    .filter((product) => params.maxPrice === undefined || Number(product.price) <= params.maxPrice)
    .filter((product) => !params.inStockOnly || product.stock > 0)
    .filter((product) => {
      if (!query) return true;
      return [product.name, product.category, product.brand, ...product.tags, ...product.selling_points].some((text) =>
        text.toLowerCase().includes(query.toLowerCase())
      );
    })
    .sort((a, b) => scoreProduct(b, query) - scoreProduct(a, query));
};

const rankForIntent = (text: string, category?: Category | null, budget?: number) =>
  products
    .filter((product) => !category || product.category === category)
    .filter((product) => !budget || Number(product.price) <= Math.round(budget * 1.15))
    .sort((a, b) => scoreProduct(b, text) - scoreProduct(a, text));

const mockClient = {
  async health() {
    return ok<HealthData>({ status: "ok", api: "ok", database: "not_configured", redis: "not_configured", version: "mock", source: "mock" });
  },

  async searchProducts(params: Parameters<typeof filterProducts>[0]) {
    if (params.q?.includes("失败")) return fail<Product[]>("API_FAILED", "商品检索服务暂时不可用，请稍后重试。");
    return ok(filterProducts(params));
  },

  async getProduct(id: string) {
    const product = productCache.get(id) ?? products.find((item) => item.id === id);
    return product ? ok(product) : fail<Product>("NOT_FOUND", "没有找到该商品。");
  },

  async chat(input: { message: string; conversation_id?: string; user_id?: string }): Promise<ApiEnvelope<ChatResponse>> {
    if (/超时|timeout/i.test(input.message)) {
      return fail<ChatResponse>("MODEL_TIMEOUT", "模型响应超时，已保留上下文，可重试或转人工。", 900);
    }
    if (/投诉|退款|退货|保修|维修|坏了|生气|不处理|人工|客服/.test(input.message)) {
      return ok({
        reply: "这个问题涉及售后判断，我建议转人工处理。我已经整理了诉求摘要。",
        conversation_id: input.conversation_id ?? "conv_mock_001",
        intent: "handoff",
        category: null,
        slots: { reason: "售后/投诉", priority: "高" },
        recommendations: [],
        next_action: "handoff"
      });
    }
    const category = inferCategory(input.message);
    const budget = parseBudget(input.message);
    const candidates = rankForIntent(input.message, category, budget).slice(0, 4);
    return ok({
      reply:
        candidates.length > 0
          ? `我理解你的核心需求是${budget ? `预算约${budget}元，` : ""}${category || "数码产品"}偏向${/游戏/.test(input.message) ? "游戏性能" : "场景匹配"}。下面优先给你可直接购买的候选。`
          : "暂时没有完全匹配的商品，可以放宽预算或补充品牌偏好。",
      conversation_id: input.conversation_id ?? "conv_mock_001",
      intent: "recommend",
      category,
      slots: {
        budget_max: budget ?? null,
        category,
        uses: /游戏/.test(input.message) ? ["游戏"] : /办公/.test(input.message) ? ["办公"] : /学习/.test(input.message) ? ["学习"] : ["综合"],
        keywords: input.message
      },
      recommendations: candidates,
      next_action: candidates.length > 0 ? "view_product" : "ask_followup"
    });
  },

  async recommend(input: RecommendRequest): Promise<ApiEnvelope<RecommendResponse>> {
    const budget = input.budget_max ?? parseBudget(input.query);
    const category = input.category ?? inferCategory(input.query);
    const recommendations = rankForIntent(input.query, category, budget).slice(0, input.limit ?? 5);
    return ok({
      intent: "recommend",
      category,
      slots: { budget_max: budget ?? null, category, brand: input.brand ?? null, keywords: input.query },
      recommendations
    });
  },

  async compare(ids: string[]): Promise<ApiEnvelope<CompareResponse>> {
    const selected = ids.map((id) => productCache.get(id) ?? products.find((product) => product.id === id)).filter(Boolean) as Product[];
    if (selected.length < 2) return fail<CompareResponse>("COMPARE_TOO_FEW", "请选择至少2个商品进行对比。");
    const specKeys = Array.from(new Set(selected.flatMap((product) => Object.keys(product.specs))));
    const diff_groups: CompareResponse["diff_groups"] = [
      { group: "基础信息", field: "价格", values: Object.fromEntries(selected.map((product) => [product.id, `¥${product.price}`])), decision_weight: "high" },
      { group: "基础信息", field: "库存", values: Object.fromEntries(selected.map((product) => [product.id, product.stock])), decision_weight: "medium" },
      ...specKeys.map((key) => ({
        group: "核心参数",
        field: key,
        values: Object.fromEntries(selected.map((product) => [product.id, product.specs[key] ?? null])),
        decision_weight: "medium" as const
      }))
    ];
    const best = [...selected].sort((a, b) => (b.rating ?? 4.6) - (a.rating ?? 4.6) || Number(a.price) - Number(b.price))[0];
    return ok({
      products: selected,
      diff_groups,
      ai_summary: `${best.name} 综合评分和购买确定性更高；如果预算优先，建议优先看价格更低且库存充足的型号。`,
      best_for: Object.fromEntries(selected.map((product) => [product.id, product.selling_points.slice(0, 2).join("、")]))
    });
  },

  async handoff(input: { message: string; conversation_id?: string; user_id?: string }) {
    return ok<HandoffTicket>({
      ticket_id: `HD${Date.now().toString().slice(-6)}`,
      conversation_id: input.conversation_id ?? null,
      status: "open",
      reason: "售后/人工转接",
      summary: input.message
    }, 700);
  },

  async feedback(input: { conversation_id?: string; product_id?: string; feedback_type: string; note?: string; payload?: Record<string, unknown> }) {
    return ok({ feedback_id: `FB${Date.now().toString().slice(-6)}`, conversation_id: input.conversation_id ?? null, product_id: input.product_id ?? null, feedback_type: input.feedback_type, status: "recorded" as const });
  },

  async adminConversations() {
    return ok([
      { id: "conv_mock_001", user: "访客用户", intent: "recommend", category: "laptop", slots: "预算5000 / 游戏", status: "active" },
      { id: "conv_mock_002", user: "售后用户", intent: "handoff", category: "-", slots: "退货争议", status: "handoff" }
    ]);
  },

  async metrics() {
    return ok([
      { label: "推荐点击率", value: "38.6%", delta: "+4.2%" },
      { label: "加购率", value: "21.4%", delta: "+2.8%" },
      { label: "模拟下单率", value: "9.7%", delta: "+1.1%" },
      { label: "转人工率", value: "6.3%", delta: "-0.9%" },
      { label: "模型超时率", value: "1.8%", delta: "-0.3%" },
      { label: "平均响应", value: "820ms", delta: "-110ms" }
    ]);
  }
};

export const apiClient = {
  async health() {
    if (!canUseBackend()) return mockClient.health();
    try {
      const response = await request<HealthData>("/health");
      return response.success && response.data
        ? { ...response, data: { ...response.data, source: "backend" as const } }
        : response;
    } catch {
      if (shouldFallback()) return mockClient.health();
      return fail<HealthData>("NETWORK_ERROR", "无法连接后端 /health，请确认 http://127.0.0.1:8000 已启动。");
    }
  },

  async searchProducts(params: Parameters<typeof filterProducts>[0]) {
    if (!canUseBackend()) return mockClient.searchProducts(params);
    try {
      const response = await request<RecommendResponse>("/recommend", {
        method: "POST",
        body: JSON.stringify({
          query: params.q || params.category || "数码商品",
          category: params.category || undefined,
          brand: params.brand,
          budget_min: params.minPrice,
          budget_max: params.maxPrice,
          limit: 10
        })
      });
      if (!response.success || !response.data) return response as unknown as ApiEnvelope<Product[]>;
      cacheProducts(response.data.recommendations);
      const filtered = response.data.recommendations.filter((product) => !params.inStockOnly || product.stock > 0);
      return { ...response, data: filtered } as ApiEnvelope<Product[]>;
    } catch {
      if (shouldFallback()) return mockClient.searchProducts(params);
      return fail<Product[]>("NETWORK_ERROR", "无法连接后端 /recommend，请确认服务已启动。");
    }
  },

  async getProduct(id: string) {
    return mockClient.getProduct(id);
  },

  async chat(input: { message: string; conversation_id?: string; user_id?: string }): Promise<ApiEnvelope<ChatResponse>> {
    if (!canUseBackend()) return mockClient.chat(input);
    try {
      const response = await request<ChatResponse>("/chat", { method: "POST", body: JSON.stringify(input) });
      if (response.success) cacheProducts(response.data?.recommendations);
      return response;
    } catch {
      if (shouldFallback()) return mockClient.chat(input);
      return fail<ChatResponse>("NETWORK_ERROR", "无法连接后端 /chat，请确认服务已启动。");
    }
  },

  async recommend(input: RecommendRequest): Promise<ApiEnvelope<RecommendResponse>> {
    if (!canUseBackend()) return mockClient.recommend(input);
    try {
      const response = await request<RecommendResponse>("/recommend", { method: "POST", body: JSON.stringify(input) });
      if (response.success) cacheProducts(response.data?.recommendations);
      return response;
    } catch {
      if (shouldFallback()) return mockClient.recommend(input);
      return fail<RecommendResponse>("NETWORK_ERROR", "无法连接后端 /recommend，请确认服务已启动。");
    }
  },

  async compare(ids: string[]): Promise<ApiEnvelope<CompareResponse>> {
    if (!canUseBackend()) return mockClient.compare(ids);
    try {
      const response = await request<CompareResponse>("/compare", { method: "POST", body: JSON.stringify({ product_ids: ids }) });
      if (response.success) cacheProducts(response.data?.products);
      return response;
    } catch {
      if (shouldFallback()) return mockClient.compare(ids);
      return fail<CompareResponse>("NETWORK_ERROR", "无法连接后端 /compare，请确认服务已启动。");
    }
  },

  async handoff(input: { message: string; conversation_id?: string; user_id?: string }) {
    if (!canUseBackend()) return mockClient.handoff(input);
    try {
      return await request<HandoffTicket>("/handoff", { method: "POST", body: JSON.stringify(input) });
    } catch {
      if (shouldFallback()) return mockClient.handoff(input);
      return fail<HandoffTicket>("NETWORK_ERROR", "无法连接后端 /handoff，请确认服务已启动。");
    }
  },

  async feedback(input: { conversation_id?: string; product_id?: string; feedback_type: string; note?: string; payload?: Record<string, unknown> }) {
    if (!canUseBackend()) return mockClient.feedback(input);
    try {
      return await request("/feedback", { method: "POST", body: JSON.stringify(input) });
    } catch {
      if (shouldFallback()) return mockClient.feedback(input);
      return fail("NETWORK_ERROR", "无法连接后端 /feedback，请确认服务已启动。");
    }
  },

  adminConversations: mockClient.adminConversations,
  metrics: mockClient.metrics
};

export { mockClient };
