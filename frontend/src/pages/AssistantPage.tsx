import { Alert, Button, Form, Input, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/mockClient";
import { ChatTimeline } from "../components/ChatTimeline";
import { RecommendationPanel } from "../components/RecommendationPanel";
import { SlotSummary } from "../components/SlotSummary";
import { useShop } from "../state/ShopContext";

export const AssistantPage = () => {
  const { messages, pushMessage, conversationId, setLastChat, lastChat } = useShop();
  const [form] = Form.useForm<{ message: string }>();
  const chat = useMutation({
    mutationFn: apiClient.chat,
    onSuccess(response, variables) {
      if (response.success && response.data) {
        pushMessage({ id: `ap_u_${Date.now()}`, role: "user", content: variables.message });
        pushMessage({ id: `ap_a_${Date.now()}`, role: "assistant", content: response.data.reply });
        setLastChat(response.data);
        form.resetFields();
      }
    }
  });

  return (
    <div className="assistant-page">
      <main>
        <Typography.Title level={2}>AI 导购</Typography.Title>
        <ChatTimeline messages={messages} />
        {chat.data && !chat.data.success && <Alert type="error" showIcon message={chat.data.error?.code} description={chat.data.error?.message} />}
        <Form form={form} initialValues={{ message: "预算 5000，想买游戏本" }} onFinish={(values) => chat.mutate({ message: values.message, conversation_id: conversationId })}>
          <Form.Item name="message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="输入预算、用途、品牌偏好或参数要求" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={chat.isPending} data-testid="assistant-submit">发送</Button>
        </Form>
      </main>
      <aside>
        <Typography.Title level={4}>需求槽位</Typography.Title>
        <SlotSummary response={lastChat} />
      </aside>
      {lastChat?.recommendations?.length ? <RecommendationPanel products={lastChat.recommendations} /> : null}
    </div>
  );
};
