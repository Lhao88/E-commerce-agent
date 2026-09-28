import { Avatar, Empty } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";
import type { ChatMessage } from "../types";

export const ChatTimeline = ({ messages, pending }: { messages: ChatMessage[]; pending?: boolean }) => {
  if (messages.length === 0) return <Empty description="还没有对话" />;

  return (
    <div className="chat-timeline" data-testid="chat-timeline">
      {messages.map((message) => (
        <div key={message.id} className={`chat-message ${message.role}`}>
          <Avatar icon={message.role === "user" ? <UserOutlined /> : <RobotOutlined />} />
          <div className="chat-bubble">{message.content}</div>
        </div>
      ))}
      {pending && (
        <div className="chat-message assistant pending">
          <Avatar icon={<RobotOutlined />} />
          <div className="chat-bubble typing-bubble">
            正在分析需求，匹配商品和关键参数<span className="typing-dots" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
};
