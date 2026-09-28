import { Form, Input, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../api/mockClient";
import { HandoffBanner } from "../components/HandoffBanner";

export const SupportPage = () => {
  const handoff = useMutation({ mutationFn: apiClient.handoff });

  return (
    <div className="support-page">
      <Typography.Title level={2}>售后与人工转接</Typography.Title>
      <HandoffBanner
        ticket={handoff.data?.data ?? undefined}
        loading={handoff.isPending}
        onCreate={() => handoff.mutate({ message: "用户需要人工确认退换货、保修或投诉处理。" })}
      />
      <Form layout="vertical" className="support-form">
        <Form.Item label="问题类型"><Input value="退换货 / 保修 / 投诉 / 低置信度推荐" readOnly /></Form.Item>
        <Form.Item label="问题描述"><Input.TextArea rows={5} placeholder="描述你的订单、商品和需要人工处理的问题" /></Form.Item>
      </Form>
    </div>
  );
};
