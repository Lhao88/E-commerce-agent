import { Badge, Button, Input, Layout, Space, Tag } from "antd";
import { AppstoreOutlined, BarChartOutlined, CustomerServiceOutlined, MessageOutlined, ShoppingCartOutlined, SwapOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { apiClient } from "../api/mockClient";
import { useShop } from "../state/ShopContext";
import { AssistantDrawer } from "../components/AssistantDrawer";
import { categories, categoryLabels } from "../utils/category";

const { Header, Content } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
  const { cartItems, compareIds, askAi } = useShop();
  const health = useQuery({ queryKey: ["health"], queryFn: apiClient.health, refetchInterval: 30_000 });
  const healthData = health.data?.data;

  return (
    <Layout className="app-shell">
      <Header className="site-header">
        <Link to="/" className="brand">
          <span className="brand-mark">D</span>
          <span>数码导购商城</span>
        </Link>
        <Input.Search
          className="header-search"
          placeholder="搜索手机、游戏本、降噪耳机..."
          enterButton="搜索"
          onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
        />
        <Space className="header-actions">
          <Tag color={healthData?.source === "backend" ? "green" : "gold"}>
            {healthData?.source === "backend" ? "后端在线" : "Mock兜底"}
          </Tag>
          <Button icon={<MessageOutlined />} onClick={() => askAi("预算 5000，想买游戏本")}>AI导购</Button>
          <Badge count={compareIds.length} size="small"><Link to="/compare"><Button icon={<SwapOutlined />}>对比</Button></Link></Badge>
          <Badge count={cartItems.reduce((sum, item) => sum + item.quantity, 0)} size="small"><Link to="/cart"><Button icon={<ShoppingCartOutlined />}>购物车</Button></Link></Badge>
        </Space>
      </Header>
      <nav className="category-nav">
        <Link to="/"><AppstoreOutlined /> 首页</Link>
        {categories.map((category) => (
          <Link to={`/category/${encodeURIComponent(category)}`} key={category}>{categoryLabels[category]}</Link>
        ))}
        <Link to="/support"><CustomerServiceOutlined /> 售后</Link>
        <Link to="/admin/metrics"><BarChartOutlined /> 后台</Link>
      </nav>
      <Content className="site-content">
        <Outlet />
      </Content>
      <AssistantDrawer />
    </Layout>
  );
};
