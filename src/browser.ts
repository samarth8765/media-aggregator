import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { USER_AGENT } from "./scapper.constant";
import type { Browser } from "playwright";

chromium.use(StealthPlugin());

export async function getBrowser() {
  return await chromium.launch({
    headless: false, // keep false while building — easier to debug
    slowMo: 50,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function getContext(browser: Browser, sessionPath: string) {
  return await browser.newContext({
    storageState: sessionPath,
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 800 },
  });
}
