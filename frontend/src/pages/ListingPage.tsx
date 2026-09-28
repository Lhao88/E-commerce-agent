import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Input, Select, Typography } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiClient } from "../api/mockClient";
import { FilterPanel, FilterValues } from "../components/FilterPanel";
import { ProductGrid } from "../components/ProductGrid";
import { SearchIntentBar } from "../components/SearchIntentBar";
import { useShop } from "../state/ShopContext";
import { categories, categoryFromLabel, getCategoryLabel, getProductPrice } from "../utils/category";

const productQueryKey = (q: string, category: string | undefined, filters: FilterValues) => ["products", q, category, filters] as const;

export const ListingPage = ({ mode }: { mode: "category" | "search" }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterValues>({ category: categoryFromLabel(params.category ? decodeURIComponent(params.category) : undefined) });
  const [sort, setSort] = useState("default");
  const { lastChat } = useShop();
  const q = searchParams.get("q") ?? "";
  const category = mode === "category" ? categoryFromLabel(decodeURIComponent(params.category ?? "")) : categoryFromLabel(filters.category);
  const effectiveFilters = useMemo(() => (mode === "category" ? { ...filters, category } : filters), [category, filters, mode]);
  const query = useQuery({
    queryKey: productQueryKey(q, category, effectiveFilters),
    queryFn: () => apiClient.searchProducts({ ...effectiveFilters, category, q })
  });
  useEffect(() => {
    if (mode !== "category" || !category) return;
    setFilters((current) => (current.category === category ? current : { category }));
  }, [category, mode]);
  useEffect(() => {
    if (mode !== "category") return;
    const timer = window.setTimeout(() => {
      categories.forEach((item) => {
        const nextFilters = { category: item };
        queryClient.prefetchQuery({
          queryKey: productQueryKey("", item, nextFilters),
          queryFn: () => apiClient.searchProducts({ ...nextFilters, q: "" })
        });
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [mode, queryClient]);
  const handleCategoryChange = useCallback((nextCategory: string) => {
    setFilters({ category: nextCategory });
    navigate(`/category/${encodeURIComponent(nextCategory)}`);
  }, [navigate]);
  const list = useMemo(() => {
    const data = query.data?.data ?? [];
    if (sort === "priceAsc") return [...data].sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sort === "priceDesc") return [...data].sort((a, b) => getProductPrice(b) - getProductPrice(a));
    if (sort === "sales") return [...data].sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0));
    return data;
  }, [query.data?.data, sort]);

  return (
    <div className="listing-page">
      <div className="page-head">
        <Typography.Title level={2}>{mode === "category" ? `${getCategoryLabel(category)}频道` : "搜索结果"}</Typography.Title>
        <Input.Search defaultValue={q} placeholder="搜索商品或需求" enterButton onSearch={(value) => setSearchParams({ q: value })} />
      </div>
      <SearchIntentBar intent={lastChat} />
      {query.data && !query.data.success && <Alert type="error" showIcon message={query.data.error?.message} />}
      <div className="catalog-layout">
        <FilterPanel
          value={{ ...filters, category }}
          onChange={setFilters}
          onCategoryChange={mode === "category" ? handleCategoryChange : undefined}
          allowCategoryClear={mode !== "category"}
        />
        <main className="catalog-main">
          <div className="list-toolbar">
            <span>共 {list.length} 件商品</span>
            <Select
              value={sort}
              onChange={setSort}
              options={[
                { value: "default", label: "综合排序" },
                { value: "priceAsc", label: "价格升序" },
                { value: "priceDesc", label: "价格降序" },
                { value: "sales", label: "销量模拟" }
              ]}
            />
          </div>
          <ProductGrid
            loading={query.isLoading}
            error={query.data && !query.data.success ? query.data.error?.message : undefined}
            products={list}
          />
        </main>
      </div>
    </div>
  );
};
