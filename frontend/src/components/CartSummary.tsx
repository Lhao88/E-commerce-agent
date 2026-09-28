import { Alert, Button, Divider, InputNumber, List, Result, Space, Typography } from "antd";
import { CheckCircleOutlined, DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { products } from "../data/products";
import { useShop } from "../state/ShopContext";
import { getCategoryLabel, getProductPrice, getProductTone } from "../utils/category";

export const CartSummary = () => {
  const { cartItems, changeQuantity, removeFromCart, addToCompare, clearCart } = useShop();
  const [ordered, setOrdered] = useState(false);
  const cartProducts = useMemo(
    () => cartItems.map((item) => ({ item, product: products.find((product) => product.id === item.productId)! })).filter((entry) => entry.product),
    [cartItems]
  );
  const total = cartProducts.reduce((sum, entry) => sum + getProductPrice(entry.product) * entry.item.quantity, 0);

  if (ordered) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined />}
        title="模拟下单成功"
        subTitle={`订单号 MOCK${Date.now().toString().slice(-6)}，已记录为推荐转化事件。`}
        extra={<Button onClick={() => setOrdered(false)}>继续逛逛</Button>}
      />
    );
  }

  return (
    <section className="cart-layout">
      <div className="cart-list">
        <List
          dataSource={cartProducts}
          locale={{ emptyText: "购物车为空，可以从推荐商品或详情页加入商品。" }}
          renderItem={({ item, product }) => (
            <List.Item
              actions={[
                <InputNumber min={1} max={product.stock} value={item.quantity} onChange={(value) => changeQuantity(product.id, value ?? 1)} />,
                <Button icon={<SwapOutlined />} onClick={() => addToCompare(product)}>对比</Button>,
                <Button danger icon={<DeleteOutlined />} onClick={() => removeFromCart(product.id)}>移除</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<div className="mini-visual" style={{ background: getProductTone(product) }}>{getCategoryLabel(product.category)}</div>}
                title={product.name}
                description={`${product.brand} / 库存 ${product.stock} / ${product.after_sales_policy}`}
              />
              <strong>¥{(getProductPrice(product) * item.quantity).toLocaleString("zh-CN")}</strong>
            </List.Item>
          )}
        />
      </div>
      <aside className="cart-summary">
        <Typography.Title level={4}>订单摘要</Typography.Title>
        <Space direction="vertical" className="full-width">
          <div className="summary-row"><span>商品件数</span><strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
          <div className="summary-row"><span>商品金额</span><strong>¥{total.toLocaleString("zh-CN")}</strong></div>
          <Divider />
          <Alert type="info" showIcon message="AI 补充建议" description="购买笔记本可考虑鼠标、耳机和延保；购买手机可考虑碎屏险和充电器。" />
          <Button type="primary" size="large" disabled={cartItems.length === 0} onClick={() => { setOrdered(true); clearCart(); }}>
            模拟下单
          </Button>
        </Space>
      </aside>
    </section>
  );
};
