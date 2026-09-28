import { Alert, Button } from "antd";
import { CustomerServiceOutlined } from "@ant-design/icons";
import type { HandoffTicket } from "../types";

export const HandoffBanner = ({ ticket, loading, onCreate }: { ticket?: HandoffTicket; loading?: boolean; onCreate?: () => void }) => (
  <Alert
    type={ticket ? "success" : "warning"}
    showIcon
    icon={<CustomerServiceOutlined />}
    message={ticket ? `人工工单已创建：${ticket.ticket_id}` : "需要人工介入时会生成工单并保留对话摘要"}
    description={ticket ? `${ticket.reason} / ${ticket.summary}` : "适用于投诉、退货争议、低置信度推荐或复杂售后问题。"}
    action={onCreate ? <Button loading={loading} onClick={onCreate}>转人工</Button> : undefined}
  />
);
