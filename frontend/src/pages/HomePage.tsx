import { Alert, Button, Form, Input, Segmented, Space, Typography } from "antd";
import { RobotOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/mockClient";
import { ProductGrid } from "../components/ProductGrid";
import { RecommendationPanel } from "../components/RecommendationPanel";
import { SearchIntentBar } from "../components/SearchIntentBar";
import { useShop } from "../state/ShopContext";
import { categories, categoryLabels } from "../utils/category";

export const HomePage = () => {
  const navigate = useNavigate();
  const { askAi, setLastChat, pushMessage } = useShop();
  const featured = useQuery({ queryKey: ["featured"], queryFn: () => apiClient.searchProducts({}) });
  const chat = useMutation({
    mutationFn: (input: { message: string }) => apiClient.recommend({ query: input.message, limit: 5 }),
    onSuccess(response, variables) {
      if (response.success && response.data) {
        const intent = {
          reply: "已根据你的预算、用途和品类偏好生成推荐。",
          conversation_id: "recommend_home",
          intent: response.data.intent,
          category: response.data.category,
          slots: response.data.slots,
          recommendations: response.data.recommendations,
          next_action: "view_product" as const
        };
        setLastChat(intent);
        pushMessage({ id: `home_u_${Date.now()}`, role: "user", content: variables.message });
        pushMessage({ id: `home_a_${Date.now()}`, role: "assistant", content: intent.reply });
      }
    }
  });

  return (
    <div className="home-page">
      <section className="commerce-hero">
        <div className="hero-main">
          <Typography.Title>数码商品导购前台</Typography.Title>
          <Typography.Text>按预算、用途和参数偏好筛选真实候选，AI 导购嵌入购物主链路。</Typography.Text>
          <Form
            className="hero-search"
            initialValues={{ message: "预算 5000，想买游戏本" }}
            onFinish={(values) => chat.mutate({ message: values.message })}
          >
            <Form.Item name="message">
              <Input size="large" prefix={<SearchOutlined />} placeholder="预算 5000，想买游戏本" />
            </Form.Item>
            <Button type="primary" size="large" htmlType="submit" loading={chat.isPending} data-testid="home-ai-submit">
              获取推荐
            </Button>
            <Button size="large" icon={<RobotOutlined />} onClick={() => askAi("预算 5000，想买游戏本")}>
              打开导购
            </Button>
          </Form>
          {chat.data && !chat.data.success && <Alert type="error" showIcon message={chat.data.error?.message} />}
          {chat.data?.data && <SearchIntentBar intent={{
            reply: "",
            conversation_id: "recommend_home",
            intent: chat.data.data.intent,
            category: chat.data.data.category,
            slots: chat.data.data.slots,
            recommendations: chat.data.data.recommendations,
            next_action: "view_product"
          }} />}
        </div>
        <aside className="hero-side">
          <div className="channel-title">品类频道</div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category} to={`/category/${encodeURIComponent(category)}`}>{categoryLabels[category]}</Link>
            ))}
          </div>
          <Segmented block options={["游戏", "办公", "学习", "拍照", "通勤"]} onChange={(value) => navigate(`/search?q=${encodeURIComponent(String(value))}`)} />
        </aside>
      </section>
      {chat.data?.data?.recommendations?.length ? (
        <RecommendationPanel products={chat.data.data.recommendations} title="根据你的需求推荐" />
      ) : (
        <section>
          <div className="section-head">
            <Typography.Title level={3}>热门数码商品</Typography.Title>
            <Space><Link to="/search?q=游戏本">游戏本</Link><Link to="/search?q=降噪">降噪耳机</Link><Link to="/search?q=拍照">拍照手机</Link></Space>
          </div>
          <ProductGrid
            loading={featured.isLoading}
            error={featured.data && !featured.data.success ? featured.data.error?.message : undefined}
            products={featured.data?.data?.slice(0, 8)}
          />
        </section>
      )}
    </div>
  );
};
