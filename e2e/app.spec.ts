import { test, expect } from "@playwright/test";
test("learning progress, notes and bookmarks survive reload", async ({
  page,
}) => {
  await page.goto("/learn/variables");
  await expect(
    page.getByRole("button", { name: "Mark complete", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Mark complete", exact: true })
    .click();
  await expect(page.getByRole("button", { name: "Completed ✓" })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Your notes" })
    .fill("A name for a value.");
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Your notes" })).toHaveValue(
    "A name for a value.",
  );
  await expect(page.getByRole("button", { name: "Completed ✓" })).toBeVisible();
  await page.goto("/learn/data-types");
  await expect(
    page.getByRole("button", { name: "Mark complete", exact: true }),
  ).toBeEnabled();
  await page.goto("/bookmarks");
  await expect(
    page.getByRole("heading", { name: "Variables", exact: true }),
  ).toBeVisible();
});
test("practice statuses and revisions persist", async ({ page }) => {
  await page.goto("/practice/two-sum");
  await page.getByLabel("Practice status").selectOption("SOLVED");
  await page.getByLabel("Revisit date").fill("2020-01-01");
  await page.reload();
  await expect(page.getByLabel("Practice status")).toHaveValue("SOLVED");
  await page.goto("/planner");
  await expect(
    page.getByRole("button", { name: "Reviewed", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reviewed", exact: true }).click();
  await expect(
    page.getByText("No revisions due.", { exact: false }),
  ).toBeVisible();
});
test("visualizer supports stepping and rejects unsorted search input", async ({
  page,
}) => {
  await page.goto("/visualizer/binary-search");
  await expect(page.getByText("Step 1 /", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Step 2 /", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByText("Step 1 /", { exact: false })).toBeVisible();
  await page.getByLabel("Input values").fill("8, 1, 4");
  await page.getByRole("button", { name: "Apply input" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "sorted" }),
  ).toContainText("sorted");
});
test("public routes render without errors or horizontal page overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/dashboard",
    "/roadmap",
    "/visualizer",
    "/practice",
    "/analytics",
    "/planner",
    "/bookmarks",
    "/profile",
    "/auth",
    "/learn/variables",
    "/visualizer/dijkstra",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator('[aria-label="Loading your learning space"]'),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("dashboard adapts from 320px to desktop", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("h1")).toBeVisible();
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `width ${width}`,
    ).toBe(true);
  }
  await page.screenshot({
    path: `test-results/dashboard-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test("roadmap graph opens and mobile navigation works", async ({
  page,
  isMobile,
}) => {
  await page.goto("/roadmap");
  await page.getByRole("button", { name: "Show prerequisite graph" }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(102);
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("link", { name: "Study planner", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Make room for progress" }),
    ).toBeVisible();
  }
});

test("initial target matches displayed controls and playback finishes", async ({
  page,
}) => {
  await page.goto("/visualizer/binary-search");
  await page.getByLabel("Playback speed").selectOption("250");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText("Found 8 at index 4.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
});

test("authentication routes and publishing metadata are available", async ({
  page,
  request,
}) => {
  for (const [path, title] of [
    ["login", "Welcome back"],
    ["signup", "Start your learning journey"],
    ["reset-password", "Reset your password"],
    ["update-password", "Choose a new password"],
  ]) {
    await page.goto(`/auth/${path}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Demo mode:", { exact: false })).toBeVisible();
  }
  expect((await request.get("/robots.txt")).ok()).toBe(true);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/learn/variables");
  expect((await request.get("/opengraph-image")).ok()).toBe(true);
  await page.goto("/learn/variables");
  await expect(page.locator(".shiki")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
});
