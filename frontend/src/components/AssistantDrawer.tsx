import { Alert, Button, Drawer, Form, Input, Spin, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "../api/mockClient";
import { useShop } from "../state/ShopContext";
import { ChatTimeline } from "./ChatTimeline";
import { RecommendationPanel } from "./RecommendationPanel";
import { SlotSummary } from "./SlotSummary";

export const AssistantDrawer = () => {
  const { drawerOpen, setDrawerOpen, drawerSeed, messages, pushMessage, conversationId, setLastChat, lastChat } = useShop();
  const [form] = Form.useForm<{ message: string }>();
  const chat = useMutation({
    mutationFn: apiClient.chat,
    onSuccess: (response, variables) => {
      if (!response.success || !response.data) return;
      pushMessage({ id: `a_${Date.now()}`, role: "assistant", content: response.data.reply });
      setLastChat(response.data);
    }
  });

  useEffect(() => {
    if (drawerOpen && drawerSeed) form.setFieldValue("message", drawerSeed);
  }, [drawerOpen, drawerSeed, form]);

  const submit = (values: { message: string }) => {
    const message = values.message.trim();
    if (!message) return;
    form.setFieldValue("message", "");
    pushMessage({ id: `u_${Date.now()}`, role: "user", content: message });
    chat.mutate({ message, conversation_id: conversationId });
  };

  return (
    <Drawer
      title="AI 数码导购"
      width={520}
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      rootClassName="assistant-drawer-root"
      className="assistant-drawer"
    >
      <div className="assistant-layout">
        <div className="assistant-scroll">
          <ChatTimeline messages={messages} pending={chat.isPending} />
          {chat.data && !chat.data.success && (
            <Alert type="error" showIcon message={chat.data.error?.code} description={chat.data.error?.message} />
          )}
          <div className="drawer-section">
            <Typography.Title level={5}>需求槽位</Typography.Title>
            <SlotSummary response={lastChat} />
          </div>
          {lastChat?.recommendations && lastChat.recommendations.length > 0 && (
            <RecommendationPanel title="导购推荐" products={lastChat.recommendations} />
          )}
        </div>
        <Form form={form} onFinish={submit} className="assistant-input">
          <Form.Item name="message" rules={[{ required: true, message: "请输入你的需求" }]}>
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="例如：预算 5000，想买游戏本" />
          </Form.Item>
          {chat.isPending && (
            <div className="assistant-status">
              <Spin size="small" />
              <span>AI 正在生成推荐，通常需要几秒钟...</span>
            </div>
          )}
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={chat.isPending} block>
            发送给 AI
          </Button>
        </Form>
      </div>
    </Drawer>
  );
};
