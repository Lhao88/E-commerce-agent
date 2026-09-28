import { Alert, Empty, Skeleton } from "antd";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ products, loading, error }: { products?: Product[]; loading?: boolean; error?: string }) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="product-card skeleton-card" key={index}>
            <Skeleton.Image active />
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <Alert type="error" showIcon message="接口失败" description={error} />;
  }

  if (!products || products.length === 0) {
    return <Empty description="暂无匹配商品，试试放宽预算、切换品牌，或让 AI 继续追问需求。" />;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};
