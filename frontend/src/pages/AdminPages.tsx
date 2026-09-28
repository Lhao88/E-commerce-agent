import { Table, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/mockClient";
import { products } from "../data/products";
import { MetricCard } from "../components/MetricCard";
import { getCategoryLabel, getProductPrice } from "../utils/category";

export const AdminProductsPage = () => (
  <div className="page-stack">
    <Typography.Title level={2}>商品库管理</Typography.Title>
    <Table
      rowKey="id"
      scroll={{ x: 980 }}
      dataSource={products}
      columns={[
        { title: "商品", dataIndex: "name" },
        { title: "品类", dataIndex: "category", render: getCategoryLabel },
        { title: "品牌", dataIndex: "brand" },
        { title: "价格", render: (_, product) => `¥${getProductPrice(product).toLocaleString("zh-CN")}` },
        { title: "库存", dataIndex: "stock" },
        { title: "标签", dataIndex: "tags", render: (tags: string[]) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>) }
      ]}
    />
  </div>
);

export const AdminConversationsPage = () => {
  const query = useQuery({ queryKey: ["admin-conversations"], queryFn: apiClient.adminConversations });
  return (
    <div className="page-stack">
      <Typography.Title level={2}>会话监控</Typography.Title>
      <Table
        rowKey="id"
        loading={query.isLoading}
        dataSource={query.data?.data ?? []}
        columns={[
          { title: "会话ID", dataIndex: "id" },
          { title: "用户", dataIndex: "user" },
          { title: "意图", dataIndex: "intent" },
          { title: "品类", dataIndex: "category" },
          { title: "槽位", dataIndex: "slots" },
          { title: "状态", dataIndex: "status", render: (status) => <Tag color={status === "handoff" ? "orange" : "green"}>{status}</Tag> }
        ]}
      />
    </div>
  );
};

export const AdminMetricsPage = () => {
  const query = useQuery({ queryKey: ["metrics"], queryFn: apiClient.metrics });
  return (
    <div className="page-stack">
      <Typography.Title level={2}>推荐效果面板</Typography.Title>
      <div className="metric-grid">
        {(query.data?.data ?? []).map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </div>
  );
};
