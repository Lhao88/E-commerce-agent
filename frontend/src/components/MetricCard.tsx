import { Card, Statistic } from "antd";

export const MetricCard = ({ label, value, delta }: { label: string; value: string; delta: string }) => (
  <Card className="metric-card">
    <Statistic title={label} value={value} />
    <span className={delta.startsWith("-") ? "metric-down" : "metric-up"}>{delta}</span>
  </Card>
);
