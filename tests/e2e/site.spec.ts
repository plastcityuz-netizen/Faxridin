import { test as base, expect, type Page } from "@playwright/test";

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      // Expected HTTP failure responses are tested explicitly; all JS/console errors remain fatal.
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) errors.push(message.text());
    });
    await use(errors);
    expect(errors, "No runtime, hydration or console errors").toEqual([]);
  }, { auto: true }],
});

const prices = [[7, 32], [10, 40], [12, 50], [14, 62], [15, 67], [16, 71], [18, 79], [20, 87]] as const;
const thicknesses = [1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 60];
const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const requestId = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5";
const validPayload = () => ({ selection: { productId: "granules", quantity: "10" }, customer: { name: "Ali", phone: "+998901234567", address: "Toshkent, Chilonzor", note: "Test izoh" }, requestId });

async function home(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; });
}
async function openProduct(page: Page, id: string) {
  const card = page.getByTestId(`product-${id}`);
  const details = card.getByRole("button", { name: "Batafsil" });
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await details.click();
  await expect(card.getByRole("button", { name: "Yopish" })).toHaveAttribute("aria-expanded", "true");
  return card;
}
async function fillCustomer(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Ismingiz").fill("Ali");
  await dialog.getByLabel("Telefon raqamingiz").fill("+998 90 123 45 67");
  await dialog.getByLabel("Manzilingiz").fill("Toshkent, Chilonzor tumani");
  await dialog.getByLabel("Qo‘shimcha izoh").fill("Buyurtma bo‘yicha bog‘laning.");
}
async function mockSent(page: Page) {
  await page.route("**/api/order", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "sent", reference: "IZO-A1B2C3D4", message: "Buyurtmangiz muvaffaqiyatli yuborildi!" }) }));
}

test("home, exact catalog, SEO and excluded functionality", async ({ page }) => {
  await home(page);
  await expect(page).toHaveTitle("IZO PLUS — Penaplast Zavodi | Sifatli EPS Penaplast");
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "IZO PLUS Penaplast Zavodi — qurilish va issiqlik izolyatsiyasi uchun sifatli EPS penaplast mahsulotlari.");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-image\.jpg/);
  await expect(page.locator(".product-card")).toHaveCount(3);
  await expect(page.locator(".production-card")).toHaveCount(6);
  await expect(page.locator(".advantage-card")).toHaveCount(6);
  await expect(page.locator(".application-card")).toHaveCount(7);
  expect(await page.locator('input[type="search"], [role="search"], select, canvas').count()).toBe(0);
  await expect(page.getByText(/3D Tajriba|WebGL|Product search|nom, zichlik/i)).toHaveCount(0);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(schema["@type"]).toBe("Organization");
  expect(schema.name).toBe("IZO PLUS");
  for (const path of ["/robots.txt", "/icon.svg", "/images/og-image.jpg"]) expect((await page.request.get(path)).status()).toBe(200);
  expect((await page.request.get("/this-page-does-not-exist")).status()).toBe(404);
});

for (const productId of ["white", "black"] as const) {
  test(`${productId}: every density, every thickness and live volume pricing`, async ({ page }) => {
    await home(page);
    const card = await openProduct(page, productId);
    await card.scrollIntoViewIfNeeded();
    await expect(card.getByRole("radio")).toHaveCount(19);
    for (const [density, price] of prices) {
      await card.getByTestId(`density-${productId}-${density}`).click();
      await expect(card.getByTestId(`total-${productId}`)).toHaveText(money(price));
      await expect(card.getByTestId(`density-${productId}-${density}`).getByRole("radio")).toBeChecked();
    }
    await card.getByTestId(`density-${productId}-15`).click();
    for (const thickness of thicknesses) {
      await card.getByTestId(`thickness-${productId}-${thickness}`).click();
      await expect(card.getByTestId(`thickness-${productId}-${thickness}`).getByRole("radio")).toBeChecked();
      await expect(card.getByTestId(`total-${productId}`)).toHaveText("$67.00");
    }
    await card.getByTestId(`quantity-${productId}`).fill("2.5");
    await expect(card.getByTestId(`total-${productId}`)).toHaveText("$167.50");
    await card.getByRole("button", { name: "Miqdorni oshirish" }).click();
    await expect(card.getByTestId(`total-${productId}`)).toHaveText("$168.17");
    await card.getByRole("button", { name: "Miqdorni kamaytirish" }).click();
    await expect(card.getByTestId(`total-${productId}`)).toHaveText("$167.50");
    for (const invalid of ["", "0", "-1", "abc", "0.001", "10001"]) {
      await card.getByTestId(`quantity-${productId}`).fill(invalid);
      await expect(card.getByRole("button", { name: "BUYURTMA BERISH" })).toBeDisabled();
      await expect(card.getByTestId(`total-${productId}`)).toHaveText("—");
    }
    await card.getByTestId(`quantity-${productId}`).fill("0.01");
    await expect(card.getByTestId(`total-${productId}`)).toHaveText("$0.67");
  });
}

test("granules: presets, exact kilogram totals and integer validation", async ({ page }) => {
  await home(page);
  const card = await openProduct(page, "granules");
  await card.scrollIntoViewIfNeeded();
  for (const kg of [10, 50, 100]) {
    await card.getByRole("button", { name: `${kg} kg`, exact: true }).click();
    await expect(card.getByTestId("total-granules")).toHaveText(money(kg * 0.7));
  }
  await card.getByTestId("quantity-granules").fill("25");
  await expect(card.getByTestId("total-granules")).toHaveText("$17.50");
  for (const invalid of ["", "0", "-1", "1.5", "abc", "100001", "1e3"]) {
    await card.getByTestId("quantity-granules").fill(invalid);
    await expect(card.getByRole("button", { name: "BUYURTMA BERISH" })).toBeDisabled();
  }
  await card.getByTestId("quantity-granules").fill("1");
  await expect(card.getByTestId("total-granules")).toHaveText("$0.70");
});

test("white order: required fields, phone validation, exact payload, success and focus restore", async ({ page }) => {
  await home(page);
  const card = await openProduct(page, "white");
  await card.getByTestId("density-white-15").click();
  await card.getByTestId("thickness-white-10").click();
  await card.getByTestId("quantity-white").fill("20");
  await expect(card.getByTestId("total-white")).toHaveText("$1,340.00");
  const trigger = card.getByRole("button", { name: "BUYURTMA BERISH" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("order-total")).toHaveText("$1,340.00");
  await dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  for (const label of ["Ismingiz", "Telefon raqamingiz", "Manzilingiz"]) await expect(dialog.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByLabel("Qo‘shimcha izoh")).toHaveAttribute("aria-invalid", "false");
  await fillCustomer(page);
  await dialog.getByLabel("Telefon raqamingiz").fill("12345");
  await dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  await expect(dialog.getByLabel("Telefon raqamingiz")).toHaveAttribute("aria-invalid", "true");
  await dialog.getByLabel("Telefon raqamingiz").fill("90 123 45 67");
  await mockSent(page);
  const requestPromise = page.waitForRequest((request) => request.url().endsWith("/api/order") && request.method() === "POST");
  await dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  const payload = (await requestPromise).postDataJSON();
  expect(payload.selection).toEqual({ productId: "white", density: 15, thicknessCm: 10, quantity: "20" });
  expect(payload.customer.phone).toBe("+998 90 123 45 67");
  expect(payload).not.toHaveProperty("totalCents");
  await expect(dialog.getByRole("heading", { name: "Buyurtmangiz muvaffaqiyatli yuborildi!" })).toBeVisible();
  await dialog.getByRole("button", { name: "YOPISH", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("black order: honest Telegram fallback, copy action and real contact link", async ({ page, context }) => {
  await home(page);
  const card = await openProduct(page, "black");
  await card.getByTestId("density-black-20").click();
  await card.getByTestId("thickness-black-60").click();
  await card.getByTestId("quantity-black").fill("2.5");
  await card.getByRole("button", { name: "BUYURTMA BERISH" }).click();
  await fillCustomer(page);
  const text = "YANGI BUYURTMA\nMahsulot: Qora penaplast\nZichlik: 20 kg/m³\nQalinlik: 60 cm\nMiqdor: 2.5 m³\nJami: $217.50";
  await page.route("**/api/order", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "manual", reference: "IZO-A1B2C3D4", telegramText: text, telegramUrl: "https://t.me/penaplast_uz", message: "Buyurtma matni tayyor." }) }));
  await page.getByRole("dialog").getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Buyurtmangiz Telegramga tayyor" })).toBeVisible();
  await expect(dialog.getByText("Hali yuborilmadi.", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "TELEGRAMNI OCHISH" })).toHaveAttribute("href", "https://t.me/penaplast_uz");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await dialog.getByRole("button", { name: "MATNNI NUSXALASH" }).click();
  await expect(dialog.getByRole("button", { name: "NUSXALANDI" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("granules order: no sheet dimensions in the submitted order", async ({ page }) => {
  await home(page);
  const card = await openProduct(page, "granules");
  await card.getByRole("button", { name: "100 kg", exact: true }).click();
  await card.getByRole("button", { name: "BUYURTMA BERISH" }).click();
  await fillCustomer(page);
  await mockSent(page);
  const requestPromise = page.waitForRequest((request) => request.url().endsWith("/api/order") && request.method() === "POST");
  await page.getByRole("dialog").getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  const payload = (await requestPromise).postDataJSON();
  expect(payload.selection).toEqual({ productId: "granules", quantity: "100" });
  await expect(page.getByRole("heading", { name: "Buyurtmangiz muvaffaqiyatli yuborildi!" })).toBeVisible();
});

test("general CTA allows product selection and all specifications", async ({ page }) => {
  await home(page);
  await page.locator(".hero").getByRole("button", { name: "Narx so‘rash" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: "Oq penaplast", exact: true })).toBeChecked();
  await dialog.getByRole("radio", { name: "Qora penaplast", exact: true }).check({ force: true });
  await dialog.getByTestId("density-order-12").click();
  await dialog.getByTestId("thickness-order-5").click();
  await dialog.getByTestId("quantity-order").fill("3");
  await expect(dialog.getByTestId("order-total")).toHaveText("$150.00");
  await dialog.getByRole("button", { name: "Tanlovni yopish" }).click();
  await expect(dialog.getByTestId("quantity-order")).toBeHidden();
  await dialog.getByRole("button", { name: "Tanlovni o‘zgartirish" }).click();
  await expect(dialog.getByTestId("quantity-order")).toBeVisible();
  await dialog.getByRole("radio", { name: "Maydalangan penaplast", exact: true }).check({ force: true });
  await expect(dialog.getByTestId("density-order-12")).toHaveCount(0);
  await dialog.getByTestId("quantity-order").fill("50");
  await expect(dialog.getByTestId("order-total")).toHaveText("$35.00");
  await dialog.getByRole("button", { name: "Buyurtma oynasini yopish" }).click();
  await expect(dialog).toHaveCount(0);
});

test("order loading, error and retry preserve input and request identity", async ({ page }) => {
  await home(page);
  const card = await openProduct(page, "white");
  await card.getByRole("button", { name: "BUYURTMA BERISH" }).click();
  await fillCustomer(page);
  let calls = 0;
  const ids: string[] = [];
  await page.route("**/api/order", async (route) => {
    calls += 1;
    ids.push(route.request().postDataJSON().requestId);
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.fulfill({ status: calls === 1 ? 502 : 200, contentType: "application/json", body: JSON.stringify(calls === 1 ? { status: "error", message: "technical details must not appear" } : { status: "sent", reference: "IZO-RETRY", message: "Success" }) });
  });
  const dialog = page.getByRole("dialog");
  const submit = dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" });
  await submit.click();
  await expect(dialog.getByRole("button", { name: "Buyurtma yuborilmoqda..." })).toBeDisabled();
  await expect(dialog.getByRole("alert")).toHaveText("Buyurtma yuborilmadi. Qaytadan urinib ko‘ring.");
  await expect(dialog.getByLabel("Ismingiz")).toHaveValue("Ali");
  await submit.click();
  await expect(dialog.getByRole("heading", { name: "Buyurtmangiz muvaffaqiyatli yuborildi!" })).toBeVisible();
  expect(calls).toBe(2);
  expect(ids[0]).toBe(ids[1]);
});

test("all navigation anchors work on desktop and in the mobile disclosure", async ({ page }, testInfo) => {
  await home(page);
  const links = [["#home", "Bosh sahifa"], ["#products", "Mahsulotlar"], ["#about", "Biz haqimizda"], ["#production", "Ishlab chiqarish"], ["#prices", "Narxlar"], ["#contact", "Aloqa"]];
  const mobile = testInfo.project.name === "mobile";
  for (const [href, label] of links) {
    if (mobile) {
      const toggle = page.getByRole("button", { name: "Menyuni ochish" });
      await toggle.click();
      await page.locator("#mobile-navigation").getByRole("link", { name: label, exact: false }).click();
      await expect(page.locator("#mobile-navigation")).toBeHidden();
    } else await page.locator(".desktop-nav").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(href!)).toBeAttached();
  }
  await expect(page.locator(".site-header")).toBeInViewport();
  expect(await page.locator('.footer__nav a[href^="#"]').count()).toBe(8);
  await expect(page.locator('.contact-channel[href="tel:+998995132222"]')).toHaveCount(1);
});

test("responsive layouts have no horizontal overflow and all images load", async ({ page }) => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, `No overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    await page.locator(".hero").getByRole("button", { name: "Narx so‘rash" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    expect(box!.height).toBeLessThanOrEqual(900);
    await expect(dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" })).toBeInViewport();
    await page.keyboard.press("Escape");
  }
  const failedResources: string[] = [];
  page.on("response", (response) => { if (response.url().startsWith("http://127.0.0.1:3100") && response.status() >= 400) failedResources.push(response.url()); });
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  expect(failedResources).toEqual([]);
  for (const card of await page.locator(".application-card").all()) {
    const box = await card.boundingBox();
    expect(box!.height, "Every application card must have a visible height").toBeGreaterThan(150);
  }
});

test("mobile menu closes with Escape and the order dialog traps focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile disclosure behavior");
  await home(page);
  const toggle = page.getByRole("button", { name: "Menyuni ochish" });
  await toggle.click();
  await expect(page.locator("#mobile-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator("#mobile-navigation").getByRole("button", { name: "Buyurtma berish" }).click();
  await expect(page.locator("#mobile-navigation")).toBeHidden();
  await page.getByRole("dialog").getByRole("button", { name: "Buyurtma oynasini yopish" }).click();
  await expect(toggle).toBeFocused();
  await page.locator(".hero").getByRole("button", { name: "Narx so‘rash" }).click();
  const dialog = page.getByRole("dialog");
  for (let i = 0; i < 22; i += 1) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("product details disclosure retains the chosen specification", async ({ page }) => {
  await home(page);
  const card = await openProduct(page, "white");
  await card.getByTestId("density-white-20").click();
  await card.getByTestId("quantity-white").fill("2");
  await expect(card.getByTestId("total-white")).toHaveText("$174.00");
  await card.getByRole("button", { name: "Yopish" }).click();
  await expect(card.getByTestId("quantity-white")).toBeHidden();
  await card.getByRole("button", { name: "Batafsil" }).click();
  await expect(card.getByTestId("density-white-20").getByRole("radio")).toBeChecked();
  await expect(card.getByTestId("quantity-white")).toHaveValue("2");
});

test("both forms connect to the unconfigured API and offer manual delivery", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.31" });
  await home(page);
  await page.locator(".hero").getByRole("button", { name: "Narx so‘rash" }).click();
  await fillCustomer(page);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "BUYURTMANI YUBORISH" }).click();
  await expect(dialog.getByRole("heading", { name: "Buyurtmangiz Telegramga tayyor" })).toBeVisible();
  await expect(dialog.getByLabel("Telegramga yuboriladigan buyurtma matni")).toContainText("Mahsulot: Oq penaplast");
  await dialog.getByRole("button", { name: "Buyurtma oynasini yopish" }).click();
  const form = page.locator(".contact-form");
  await form.getByLabel("Ismingiz").fill("Ali");
  await form.getByLabel("Telefon raqamingiz").fill("901234567");
  await form.getByLabel("Xabaringiz").fill("Mahsulot haqida savolim bor.");
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  const result = page.locator(".contact-result");
  await expect(result.getByRole("heading", { name: "Xabaringiz Telegramga tayyor" })).toBeVisible();
  await expect(result.getByLabel("Telegramga yuboriladigan murojaat matni")).toHaveValue(/Mahsulot haqida savolim bor/);
  await expect(result.getByText("Hali yuborilmadi.", { exact: true })).toBeVisible();
});

test("contact form validates and sends an inquiry without creating a product order", async ({ page }) => {
  await home(page);
  const form = page.locator(".contact-form");
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  for (const label of ["Ismingiz", "Telefon raqamingiz", "Xabaringiz"]) await expect(form.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel("Ismingiz").fill("Ali");
  await form.getByLabel("Telefon raqamingiz").fill("123");
  await form.getByLabel("Xabaringiz").fill("Mahsulot haqida ma’lumot bering.");
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  await expect(form.getByLabel("Telefon raqamingiz")).toHaveAttribute("aria-invalid", "true");
  await form.getByLabel("Telefon raqamingiz").fill("90 123 45 67");
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "sent", reference: "IZO-A1B2C3D4", message: "Xabaringiz yuborildi!" }) }));
  const requestPromise = page.waitForRequest((request) => request.url().endsWith("/api/contact") && request.method() === "POST");
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  const payload = (await requestPromise).postDataJSON();
  expect(payload.name).toBe("Ali");
  expect(payload.phone).toBe("+998 90 123 45 67");
  expect(payload.message).toBe("Mahsulot haqida ma’lumot bering.");
  expect(payload).not.toHaveProperty("selection");
  await expect(page.getByRole("heading", { name: "Xabaringiz yuborildi!" })).toBeVisible();
  await page.getByRole("button", { name: "Yana xabar yozish" }).click();
  await expect(page.locator(".contact-form").getByLabel("Ismingiz")).toHaveValue("");
});

test("contact submission retries retain input and request identity", async ({ page }) => {
  await home(page);
  const form = page.locator(".contact-form");
  await form.getByLabel("Ismingiz").fill("Ali");
  await form.getByLabel("Telefon raqamingiz").fill("901234567");
  await form.getByLabel("Xabaringiz").fill("Narx haqida savolim bor.");
  let calls = 0;
  const ids: string[] = [];
  await page.route("**/api/contact", async (route) => {
    calls += 1;
    ids.push(route.request().postDataJSON().requestId);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ status: calls === 1 ? 502 : 200, contentType: "application/json", body: JSON.stringify(calls === 1 ? { status: "error", message: "provider details" } : { status: "sent", reference: "IZO-RETRY", message: "Success" }) });
  });
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  await expect(form.getByRole("button", { name: "Yuborilmoqda..." })).toBeDisabled();
  await expect(form.getByRole("alert")).toHaveText("Xabar yuborilmadi. Qaytadan urinib ko‘ring.");
  await expect(form.getByLabel("Xabaringiz")).toHaveValue("Narx haqida savolim bor.");
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  await expect(page.getByRole("heading", { name: "Xabaringiz yuborildi!" })).toBeVisible();
  expect(calls).toBe(2);
  expect(ids[0]).toBe(ids[1]);
});

test("contact fallback clearly requires manual Telegram delivery", async ({ page, context }) => {
  await home(page);
  const form = page.locator(".contact-form");
  await form.getByLabel("Ismingiz").fill("Ali");
  await form.getByLabel("Telefon raqamingiz").fill("901234567");
  await form.getByLabel("Xabaringiz").fill("Narx haqida savolim bor.");
  const text = "YANGI MUROJAAT\nIsm: Ali\nTelefon: +998 90 123 45 67\nXabar: Narx haqida savolim bor.";
  await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "manual", reference: "IZO-A1B2C3D4", telegramText: text, telegramUrl: "https://t.me/penaplast_uz", message: "Murojaat matni tayyor." }) }));
  await form.getByRole("button", { name: "Xabarni yuborish" }).click();
  const result = page.locator(".contact-result");
  await expect(result.getByText("Hali yuborilmadi.", { exact: true })).toBeVisible();
  await expect(result.getByRole("link", { name: "Telegramni ochish" })).toHaveAttribute("href", "https://t.me/penaplast_uz");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await result.getByRole("button", { name: "Matnni nusxalash" }).click();
  await expect(result.getByRole("button", { name: "Nusxalandi" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
});

test("catalog counts remain readable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await home(page);
  const stats = page.locator(".stats-section");
  await stats.scrollIntoViewIfNeeded();
  await expect(stats.locator("[data-count]")).toHaveText(["3", "8", "11", "6"]);
});

test.describe("server API (isolated, never sends a real Telegram message)", () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop", "API runs once"));

  test("unconfigured delivery returns an explicit manual flow", async ({ request }) => {
    const response = await request.post("/api/order", { data: validPayload(), headers: { "x-forwarded-for": "198.51.100.10" } });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("manual");
    expect(body.telegramUrl).toBe("https://t.me/penaplast_uz");
    expect(body.telegramText).toContain("Jami: $7.00");
  });

  test("rejects invalid phones, variants, quantities, origins and payloads", async ({ request }) => {
    const cases = [
      { ...validPayload(), customer: { ...validPayload().customer, phone: "123" } },
      { ...validPayload(), selection: { productId: "white", density: 9, thicknessCm: 10, quantity: "1" } },
      { ...validPayload(), selection: { productId: "black", density: 15, thicknessCm: 4, quantity: "1" } },
      { ...validPayload(), selection: { productId: "granules", quantity: "-1" } },
      { ...validPayload(), selection: { productId: "unknown", quantity: "1" } },
    ];
    for (const data of cases) {
      const response = await request.post("/api/order", { data, headers: { "x-forwarded-for": "198.51.100.11" } });
      expect(response.status()).toBe(400);
      expect((await response.json()).status).toBe("error");
    }
    expect((await request.post("/api/order", { data: validPayload(), headers: { Origin: "https://untrusted.example", "x-forwarded-for": "198.51.100.12" } })).status()).toBe(403);
    expect((await request.post("/api/order", { data: "not json", headers: { "Content-Type": "text/plain" } })).status()).toBe(415);
    expect((await request.post("/api/order", { data: "{bad", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
    expect((await request.post("/api/order", { data: { ...validPayload(), extra: "x".repeat(20_000) } })).status()).toBe(400);
    expect((await request.get("/api/order")).status()).toBe(405);
  });

  test("contact API validates input, returns an honest fallback and rate limits", async ({ request }) => {
    const contact = { name: "Ali", phone: "+998 90 123 45 67", message: "Narxni bilmoqchiman", requestId };
    const headers = { "x-forwarded-for": "198.51.100.21" };
    const response = await request.post("/api/contact", { data: contact, headers });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("manual");
    expect(body.telegramUrl).toBe("https://t.me/penaplast_uz");
    expect(body.telegramText).toContain("Narxni bilmoqchiman");
    expect((await request.post("/api/contact", { data: { ...contact, phone: "123" }, headers })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: { ...contact, message: "" }, headers })).status()).toBe(400);
    expect((await request.post("/api/contact", { data: contact, headers: { ...headers, Origin: "https://untrusted.example" } })).status()).toBe(403);
    expect((await request.post("/api/contact", { data: "bad", headers: { "Content-Type": "text/plain" } })).status()).toBe(415);
    expect((await request.post("/api/contact", { data: { ...contact, extra: "x".repeat(20_000) }, headers })).status()).toBe(400);
    for (let i = 0; i < 4; i += 1) expect((await request.post("/api/contact", { data: contact, headers })).status()).toBe(200);
    const limited = await request.post("/api/contact", { data: contact, headers });
    expect(limited.status()).toBe(429);
    expect(Number(limited.headers()["retry-after"])).toBeGreaterThan(0);
  });

  test("rate limits repeated valid requests", async ({ request }) => {
    for (let i = 0; i < 5; i += 1) {
      const response = await request.post("/api/order", { data: validPayload(), headers: { "x-forwarded-for": "198.51.100.13" } });
      expect(response.status()).toBe(200);
    }
    const response = await request.post("/api/order", { data: validPayload(), headers: { "x-forwarded-for": "198.51.100.13" } });
    expect(response.status()).toBe(429);
    expect(Number(response.headers()["retry-after"])).toBeGreaterThan(0);
  });
});
