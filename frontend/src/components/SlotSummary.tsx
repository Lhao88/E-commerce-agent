import { Descriptions, Empty, Tag } from "antd";
import type { ChatResponse } from "../types";
import { getCategoryLabel } from "../utils/category";
import { formatNextActionLabel, formatSlotLabel, formatSlotValue, isEmptySlotValue } from "../utils/intentDisplay";

export const SlotSummary = ({ response }: { response?: ChatResponse }) => {
  if (!response) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="需求槽位将在 AI 理解后显示" />;

  const visibleSlots = Object.entries(response.slots).filter(
    ([key, value]) => !isEmptySlotValue(value) && !(key === "category" && response.category)
  );

  return (
    <div className="slot-summary">
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="品类">{getCategoryLabel(response.category)}</Descriptions.Item>
        <Descriptions.Item label="下一步"><Tag color="green">{formatNextActionLabel(response.next_action)}</Tag></Descriptions.Item>
        {visibleSlots.map(([key, value]) => (
          <Descriptions.Item label={formatSlotLabel(key)} key={key}>{formatSlotValue(key, value)}</Descriptions.Item>
        ))}
      </Descriptions>
    </div>
  );
};
