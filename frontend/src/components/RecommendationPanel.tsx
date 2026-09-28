import { Typography } from "antd";
import type { Product } from "../types";
import { ProductGrid } from "./ProductGrid";

export const RecommendationPanel = ({ products, title = "AI 推荐商品" }: { products?: Product[]; title?: string }) => (
  <section className="recommendation-panel" data-testid="recommendation-panel">
    <div className="section-head">
      <Typography.Title level={4}>{title}</Typography.Title>
      <Typography.Text type="secondary">推荐理由、价格、库存和参数均来自接口返回数据。</Typography.Text>
    </div>
    <ProductGrid products={products} />
  </section>
);
