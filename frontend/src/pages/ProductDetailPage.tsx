import { Alert, Button, Descriptions, Space, Spin, Tag, Typography } from "antd";
import { CommentOutlined, ShoppingCartOutlined, SwapOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../api/mockClient";
import { useShop } from "../state/ShopContext";
import { getCategoryLabel, getProductPrice, getProductReason, getProductTone } from "../utils/category";

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart, addToCompare, askAi } = useShop();
  const productQuery = useQuery({ queryKey: ["product", id], queryFn: () => apiClient.getProduct(id ?? "") });
  const product = productQuery.data?.data;

  if (productQuery.isLoading) return <Spin tip="加载商品详情..." />;
  if (!productQuery.data?.success || !product) return <Alert type="error" showIcon message={productQuery.data?.error?.message ?? "商品不存在"} />;

  return (
    <div className="detail-page">
      <div className="detail-visual" style={{ background: getProductTone(product) }}>{getCategoryLabel(product.category)}</div>
      <main className="detail-main">
        <Space wrap>{product.tags.map((tag) => <Tag color="processing" key={tag}>{tag}</Tag>)}</Space>
        <Typography.Title>{product.name}</Typography.Title>
        <Typography.Paragraph type="secondary">{getProductReason(product)}</Typography.Paragraph>
        <div className="detail-price">¥{getProductPrice(product).toLocaleString("zh-CN")}</div>
        <div className="detail-actions">
          <Button type="primary" size="large" icon={<ShoppingCartOutlined />} onClick={() => addToCart(product)}>加入购物车</Button>
          <Button size="large" icon={<SwapOutlined />} onClick={() => addToCompare(product)}>加入对比</Button>
          <Button size="large" icon={<CommentOutlined />} onClick={() => askAi(`帮我判断 ${product.name} 和同价位商品怎么选`)}>问问 AI</Button>
        </div>
        <section className="detail-section">
          <Typography.Title level={4}>核心卖点</Typography.Title>
          <Space wrap>{product.selling_points.map((point) => <Tag key={point}>{point}</Tag>)}</Space>
        </section>
        <section className="detail-section">
          <Typography.Title level={4}>参数信息</Typography.Title>
          <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="small">
            {Object.entries(product.specs).map(([key, value]) => (
              <Descriptions.Item label={key} key={key}>{String(value)}</Descriptions.Item>
            ))}
          </Descriptions>
        </section>
        <section className="detail-section">
          <Typography.Title level={4}>售后保障</Typography.Title>
          <Alert type="info" showIcon message={product.after_sales_policy} action={<Link to="/support">转人工</Link>} />
        </section>
      </main>
    </div>
  );
};
