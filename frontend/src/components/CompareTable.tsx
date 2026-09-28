import { Alert, Button, Table, Tag, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import type { CompareResponse, Product } from "../types";
import { useShop } from "../state/ShopContext";
import { getProductPrice } from "../utils/category";

export const CompareTable = ({ data }: { data?: CompareResponse }) => {
  const { addToCart } = useShop();
  if (!data) return <Alert type="info" showIcon message="请选择 2-3 个商品开始对比。" />;

  type CompareRow = {
    key: string;
    group: string;
    label: string;
    decision_weight: CompareResponse["diff_groups"][number]["decision_weight"];
  } & Record<string, string | number | boolean | null>;

  const rows: CompareRow[] = data.diff_groups.map((item, index) => ({
    key: `${item.group}-${item.field}-${index}`,
    group: item.group,
    label: item.field,
    decision_weight: item.decision_weight,
    ...item.values
  }));

  const columns = [
    { title: "维度", dataIndex: "group", width: 110, fixed: "left" as const },
    {
      title: "参数",
      dataIndex: "label",
      width: 150,
      fixed: "left" as const,
      render: (value: string, record: CompareRow) => (
        <span>
          {value} {record.decision_weight === "high" && <Tag color="red">高权重</Tag>}
        </span>
      )
    },
    ...data.products.map((product) => ({
      title: (
        <div className="compare-product-head">
          <strong>{product.name}</strong>
          <span>¥{getProductPrice(product).toLocaleString("zh-CN")}</span>
          <Button size="small" icon={<ShoppingCartOutlined />} onClick={() => addToCart(product)}>
            加购物车
          </Button>
        </div>
      ),
      dataIndex: product.id,
      render: (value: string | number | boolean | null, record: CompareRow) => {
        const sameValues = data.products.map((item) => record[item.id]);
        const isDifferent = new Set(sameValues).size > 1;
        const displayValue = value === null || value === undefined ? "-" : String(value);
        return isDifferent ? <Tag color="orange">{displayValue}</Tag> : displayValue;
      }
    }))
  ];

  return (
    <div className="compare-table">
      <Alert type="success" showIcon message="AI 对比结论" description={data.ai_summary} />
      <div className="best-for">
        {data.products.map((product: Product) => (
          <div key={product.id}>
            <Typography.Text strong>{product.name}</Typography.Text>
            <Typography.Text type="secondary">{data.best_for[product.id]}</Typography.Text>
          </div>
        ))}
      </div>
      <Table scroll={{ x: 860 }} pagination={false} columns={columns} dataSource={rows} size="middle" />
    </div>
  );
};
