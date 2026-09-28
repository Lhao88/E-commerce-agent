import { Typography } from "antd";
import { CartSummary } from "../components/CartSummary";

export const CartPage = () => (
  <div className="page-stack">
    <Typography.Title level={2}>购物车</Typography.Title>
    <CartSummary />
  </div>
);
