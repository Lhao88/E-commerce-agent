import { Button, Checkbox, InputNumber, Select, Space } from "antd";
import { products } from "../data/products";
import { categories, categoryLabels } from "../utils/category";

export type FilterValues = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
};

export const FilterPanel = ({
  value,
  onChange,
  onCategoryChange,
  allowCategoryClear = true
}: {
  value: FilterValues;
  onChange: (value: FilterValues) => void;
  onCategoryChange?: (category: string) => void;
  allowCategoryClear?: boolean;
}) => {
  const brands = Array.from(new Set(products.map((product) => product.brand)));

  return (
    <aside className="filter-panel">
      <div className="filter-title">筛选商品</div>
      <Select
        allowClear={allowCategoryClear}
        placeholder="品类"
        value={value.category}
        options={categories.map((category) => ({ label: categoryLabels[category], value: category }))}
        onChange={(category) => {
          if (category && onCategoryChange) {
            onCategoryChange(category);
            return;
          }
          onChange({ ...value, category });
        }}
      />
      <Select
        allowClear
        showSearch
        placeholder="品牌"
        value={value.brand}
        options={brands.map((brand) => ({ label: brand, value: brand }))}
        onChange={(brand) => onChange({ ...value, brand })}
      />
      <Space.Compact block className="filter-price">
        <InputNumber min={0} placeholder="最低价" value={value.minPrice} onChange={(minPrice) => onChange({ ...value, minPrice: minPrice ?? undefined })} />
        <InputNumber min={0} placeholder="最高价" value={value.maxPrice} onChange={(maxPrice) => onChange({ ...value, maxPrice: maxPrice ?? undefined })} />
      </Space.Compact>
      <Checkbox checked={value.inStockOnly} onChange={(event) => onChange({ ...value, inStockOnly: event.target.checked })}>
        仅看有货
      </Checkbox>
      <Button onClick={() => onChange(allowCategoryClear ? {} : { category: value.category })}>重置筛选</Button>
    </aside>
  );
};
