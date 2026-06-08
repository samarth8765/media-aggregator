import { chromium } from "playwright";
import process from "node:process";
import { LINKEDIN_LOGIN_PAGE_URL, USER_AGENT } from "./scapper.constant";

async function saveSession() {
  const browser = await chromium.launch({
    headless: false, // headed so YOU can log in manually
    slowMo: 50,
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  await page.goto(LINKEDIN_LOGIN_PAGE_URL);

  console.log("👉 Log in manually in the browser window...");
  console.log("👉 Handle 2FA if prompted");
  console.log("👉 Wait until you are on the LinkedIn feed");
  console.log("👉 Then come back here and press Enter");

  // wait for you to finish logging in
  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: "./sessions/linkedin.json" });
  console.log("✅ Session saved to sessions/linkedin.json");

  await browser.close();
  process.exit(0);
}

saveSession();
