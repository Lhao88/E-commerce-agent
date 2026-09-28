import { Alert, Button, Select, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/mockClient";
import { products } from "../data/products";
import { CompareTable } from "../components/CompareTable";
import { useShop } from "../state/ShopContext";

export const ComparePage = () => {
  const { compareIds, addToCompare } = useShop();
  const ids = compareIds.length >= 2 ? compareIds : ["laptop-aurora-15", "laptop-redmi-g-pro"];
  const compare = useQuery({ queryKey: ["compare", ids], queryFn: () => apiClient.compare(ids) });

  return (
    <div className="page-stack">
      <div className="page-head">
        <Typography.Title level={2}>商品对比</Typography.Title>
        <Select
          mode="multiple"
          maxCount={3}
          value={compareIds}
          placeholder="选择对比商品"
          className="compare-select"
          options={products.map((product) => ({ label: product.name, value: product.id }))}
          onSelect={(id) => {
            const product = products.find((item) => item.id === id);
            if (product) addToCompare(product);
          }}
        />
      </div>
      {compareIds.length < 2 && <Alert type="info" showIcon message="当前对比不足2个，页面先展示游戏本示例对比。" />}
      {compare.data && !compare.data.success ? <Alert type="error" showIcon message={compare.data.error?.message} /> : <CompareTable data={compare.data?.data ?? undefined} />}
      <Button href="/">继续选购</Button>
    </div>
  );
};
