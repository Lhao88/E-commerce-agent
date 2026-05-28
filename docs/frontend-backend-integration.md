# 前后端联调 API 规范

后端本地地址：

```text
http://127.0.0.1:8000
```

后端已允许以下前端开发源跨域访问：

```text
http://localhost:5173
http://127.0.0.1:5173
```

## 统一响应

所有接口都返回统一结构：

```ts
type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: null | {
    code: string;
    message: string;
  };
  trace_id: string;
};
```

前端处理规则：

- `success === false` 时不要读取 `data`，展示 `error.message`。
- 记录 `trace_id`，方便后端排查问题。
- `price` 建议用 `Number(price)` 统一处理。

## 商品字段

```ts
type Product = {
  id: string;
  name: string;
  category: "phone" | "laptop" | "tablet" | "earphone" | "camera" | "smartwatch";
  brand: string;
  price: number | string;
  stock: number;
  tags: string[];
  specs: Record<string, string | number | boolean>;
  selling_points: string[];
  after_sales_policy: string;
  recommendation_reason?: string | null;
};
```

前端不要写死商品数据，推荐卡片、对比页和详情入口优先使用后端返回字段。

## GET /health

用于启动检查。

```ts
type HealthData = {
  status: "ok";
  api: "ok";
  database: "ok" | "not_configured";
  redis: "ok" | "not_configured";
  version: string;
};
```

## POST /recommend

请求：

```ts
type RecommendRequest = {
  query: string;
  category?: Product["category"];
  brand?: string;
  budget_min?: number;
  budget_max?: number;
  limit?: number;
};
```

示例：

```json
{
  "query": "5000 内游戏本",
  "limit": 5
}
```

响应：

```ts
type RecommendData = {
  intent: "recommend";
  category: Product["category"] | null;
  slots: {
    budget_max?: number | null;
    budget_min?: number | null;
    category?: Product["category"] | null;
    brand?: string | null;
    uses?: string[];
    recipient?: string | null;
    keywords?: string;
  };
  recommendations: Product[];
};
```

## POST /chat

请求：

```ts
type ChatRequest = {
  message: string;
  conversation_id?: string;
  user_id?: string;
};
```

示例：

```json
{
  "message": "预算 3000 送女生数码产品"
}
```

响应：

```ts
type ChatData = {
  reply: string;
  conversation_id: string;
  intent: "recommend" | "handoff";
  category: Product["category"] | null;
  slots: Record<string, unknown>;
  recommendations: Product[];
  next_action: "compare" | "ask_followup" | "view_product" | "handoff";
};
```

前端建议：

- 保存 `conversation_id`，后续聊天继续带上。
- `next_action === "handoff"` 时展示人工转接提示。
- `recommendations.length > 0` 时展示推荐卡片。

## POST /compare

请求：

```ts
type CompareRequest = {
  product_ids: string[];
};
```

约束：`product_ids` 支持 2-3 个商品 ID。

示例：

```json
{
  "product_ids": ["laptop-aurora-15", "laptop-redmi-g-pro"]
}
```

响应：

```ts
type CompareData = {
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
```

前端建议：

- `diff_groups.values` 的 key 是商品 `id`。
- `best_for[product.id]` 是该商品适合人群说明。
- `ai_summary` 可作为购买建议展示在对比表上方或下方。

## POST /handoff

请求：

```ts
type HandoffRequest = {
  message: string;
  conversation_id?: string;
  user_id?: string;
};
```

示例：

```json
{
  "message": "我要投诉退款，售后一直不处理"
}
```

响应：

```ts
type HandoffData = {
  ticket_id: string;
  conversation_id: string | null;
  reason: string;
  summary: string;
  status: "open" | "assigned" | "closed";
};
```

当前会触发人工转接的关键词包括：投诉、退款、退货、保修、维修、坏了、生气、不处理等。

## POST /feedback

请求：

```ts
type FeedbackRequest = {
  conversation_id?: string;
  product_id?: string;
  feedback_type: "click" | "reject" | "buy" | "handoff" | string;
  note?: string;
  payload?: Record<string, unknown>;
};
```

响应：

```ts
type FeedbackData = {
  feedback_id: string;
  conversation_id: string | null;
  product_id: string | null;
  feedback_type: string;
  status: "recorded";
};
```

建议埋点：

- 点击商品卡片：`feedback_type: "click"`
- 不感兴趣：`feedback_type: "reject"`
- 加入购物车或模拟购买：`feedback_type: "buy"`
- 点击人工客服：`feedback_type: "handoff"`

## 联调验收点

```text
1. /health 显示后端在线。
2. 输入“5000 内游戏本”，/recommend 返回 laptop 商品。
3. 输入“预算 3000 送女生数码产品”，/chat 返回 reply 和 recommendations。
4. 选择 2 个商品调用 /compare，能展示 diff_groups、ai_summary、best_for。
5. 输入“我要投诉退款”，/handoff 返回 ticket_id 和 open 状态。
6. API 错误时能展示 error.message，并保留 trace_id 方便排查。
```
