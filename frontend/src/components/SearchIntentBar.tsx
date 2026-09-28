import { Alert, Space, Tag } from "antd";
import type { ChatResponse } from "../types";
import { getCategoryLabel } from "../utils/category";
import { formatIntentLabel, formatSlotLabel, formatSlotValue, isEmptySlotValue } from "../utils/intentDisplay";

export const SearchIntentBar = ({ intent }: { intent?: ChatResponse }) => {
  if (!intent) {
    return <Alert className="intent-bar" type="info" showIcon message="AI 可识别预算、用途、品类和偏好，并把结果同步到商品筛选。" />;
  }

  const visibleSlots = Object.entries(intent.slots).filter(([, value]) => !isEmptySlotValue(value));

  return (
    <div className="intent-bar">
      <strong>搜索意图：</strong>
      <Space size={6} wrap>
        <Tag color="blue">{formatIntentLabel(intent.intent)}</Tag>
        {intent.category && <Tag color="geekblue">{getCategoryLabel(intent.category)}</Tag>}
        {visibleSlots.map(([key, value]) => (
          <Tag key={key}>{formatSlotLabel(key)}: {formatSlotValue(key, value)}</Tag>
        ))}
      </Space>
    </div>
  );
};
