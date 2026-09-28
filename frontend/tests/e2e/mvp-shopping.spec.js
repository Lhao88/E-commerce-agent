import { expect, test } from "@playwright/test";

test("shopping MVP covers browse, AI recommendation, detail, cart, checkout, and handoff", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "数码商品导购前台" })).toBeVisible();
  await expect(page.getByText("热门数码商品")).toBeVisible();

  await page.getByTestId("home-ai-submit").click();
  await expect(page.getByText("根据你的需求推荐")).toBeVisible();
  await expect(page.getByText(/搜索意图：/)).toBeVisible();

  await page.goto("/category/%E7%AC%94%E8%AE%B0%E6%9C%AC");
  await expect(page.getByRole("heading", { name: "笔记本频道" })).toBeVisible();
  await expect(page.getByText(/共 \d+ 件商品/)).toBeVisible();
  await expect(page.locator(".product-card").first()).toBeVisible();

  await page.locator('.product-card a[href^="/products/"]').first().click();
  await expect(page.getByText("参数信息")).toBeVisible();
  await expect(page.getByText("售后保障")).toBeVisible();

  await page.getByRole("button", { name: /加入对比/ }).click();
  await expect(page.getByText("已加入对比")).toBeVisible();

  await page.getByRole("button", { name: /加入购物车/ }).click();
  await expect(page.getByText("已加入购物车")).toBeVisible();

  await page.getByRole("link", { name: /购物车/ }).click();
  await expect(page.getByRole("heading", { name: "购物车" })).toBeVisible();
  await expect(page.getByText("订单摘要")).toBeVisible();
  await page.getByRole("button", { name: "模拟下单" }).click();
  await expect(page.getByText("模拟下单成功")).toBeVisible();

  await page.goto("/support");
  await expect(page.getByRole("heading", { name: "售后与人工转接" })).toBeVisible();
  await page.getByRole("button", { name: "转人工" }).click();
  await expect(page.getByText(/人工工单已创建/)).toBeVisible();
});

test("compare page should render AI comparison summary for selected products", async ({ page }) => {
  await page.goto("/products/laptop-aurora-15");
  await expect(page.getByText("参数信息")).toBeVisible();
  await page.getByRole("button", { name: /加入对比/ }).click();
  await expect(page.getByText("已加入对比")).toBeVisible();

  await page.getByRole("link", { name: /对比/ }).click();
  await expect(page.getByRole("heading", { name: "商品对比" })).toBeVisible();
  await expect(page.getByText("AI 对比结论")).toBeVisible();
});
