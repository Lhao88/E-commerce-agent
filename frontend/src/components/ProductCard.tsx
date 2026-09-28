import { Button, Rate, Space, Tag, Typography } from "antd";
import { CommentOutlined, ShoppingCartOutlined, SlidersOutlined, SwapOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useShop } from "../state/ShopContext";
import { getCategoryLabel, getProductPrice, getProductReason, getProductTone } from "../utils/category";
import { apiClient } from "../api/mockClient";

const { Text, Title } = Typography;

export const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, addToCompare, askAi } = useShop();
  const specPreview = Object.entries(product.specs).slice(0, 3);

  return (
    <article className="product-card" data-testid={`product-card-${product.id}`}>
      <Link to={`/products/${product.id}`} className="product-visual" style={{ background: getProductTone(product) }} onClick={() => void apiClient.feedback({ product_id: product.id, feedback_type: "click" })}>
        <span>{getCategoryLabel(product.category)}</span>
      </Link>
      <div className="product-card-body">
        <Space size={4} wrap>
          {product.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} color="processing">{tag}</Tag>
          ))}
        </Space>
        <Title level={5} className="product-title">
          <Link to={`/products/${product.id}`} onClick={() => void apiClient.feedback({ product_id: product.id, feedback_type: "click" })}>{product.name}</Link>
        </Title>
        <div className="product-meta">
          <Text type="secondary">{product.brand}</Text>
          <Rate disabled allowHalf value={product.rating ?? 4.6} />
        </div>
        <div className="price-row">
          <span className="price">¥{getProductPrice(product).toLocaleString("zh-CN")}</span>
          <Text type={product.stock > 10 ? "secondary" : "danger"}>库存 {product.stock}</Text>
        </div>
        <div className="spec-list">
          {specPreview.map(([key, value]) => (
            <span key={key}>
              <SlidersOutlined /> {key}: {String(value)}
            </span>
          ))}
        </div>
        <Text className="reason" type="secondary">{getProductReason(product)}</Text>
        <div className="card-actions">
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => { addToCart(product); void apiClient.feedback({ product_id: product.id, feedback_type: "buy", note: "add_to_cart" }); }}>
            加购物车
          </Button>
          <Button icon={<SwapOutlined />} onClick={() => addToCompare(product)}>
            对比
          </Button>
          <Button icon={<CommentOutlined />} onClick={() => askAi(`帮我分析 ${product.name} 是否适合我`)}>
            问AI
          </Button>
        </div>
      </div>
    </article>
  );
};
