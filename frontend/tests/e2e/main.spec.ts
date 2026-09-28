import { expect, test } from "@playwright/test";

test("home opens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("数码商品导购前台")).toBeVisible();
  await expect(page.getByText("品类频道")).toBeVisible();
});

test("search shows products", async ({ page }) => {
  await page.goto("/search?q=游戏本");
  await expect(page.getByText("搜索结果")).toBeVisible();
  await expect(page.getByTestId("product-card-laptop-aurora-15")).toBeVisible();
});

test("AI guide returns recommendations", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("home-ai-submit").click();
  await expect(page.getByTestId("recommendation-panel")).toBeVisible();
  await expect(page.getByTestId("product-card-laptop-aurora-15")).toBeVisible();
});

test("product can be added to compare and cart", async ({ page }) => {
  await page.goto("/products/laptop-aurora-15");
  await page.getByRole("button", { name: "加入对比" }).click();
  await page.getByRole("button", { name: "加入购物车" }).click();
  await page.getByRole("link", { name: /购物车/ }).click();
  await expect(page.getByText("雷神 Neo 15 2026 游戏本")).toBeVisible();
  await page.goto("/compare");
  await expect(page.getByText("商品对比")).toBeVisible();
});
