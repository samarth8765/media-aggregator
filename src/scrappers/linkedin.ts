import { getBrowser, getContext } from "../browser";
import { writeFile, mkdir } from "node:fs/promises";
import type { LinkedInPost } from "../interface/linkedin.interface";
import { LINKEDIN_REACTION_PAGE_URL } from "../scapper.constant";

async function humanDelay(min = 1000, max = 3000) {
  const delay = min + Math.random() * (max - min);
  await new Promise((r) => setTimeout(r, delay));
}

export async function scrapeLinkedInLikes(): Promise<LinkedInPost[]> {
  const browser = await getBrowser();
  const context = await getContext(browser, "./sessions/linkedin.json");
  const page = await context.newPage();

  console.log("🔍 Navigating to LinkedIn reactions page...");

  await page.goto(LINKEDIN_REACTION_PAGE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await humanDelay(2000, 3000);

  const posts: LinkedInPost[] = [];
  let previousHeight = 0;
  let noChangeCount = 0;

  console.log("📜 Starting to scroll and collect posts...");

  while (noChangeCount < 3) {
    // extract all currently visible posts
    const newPosts = await page.evaluate(() => {
      const items = document.querySelectorAll(
        ".profile-creator-shared-feed-update__container, .feed-shared-update-v2",
      );

      return Array.from(items).map((item) => {
        // author name
        const authorEl = item.querySelector(
          ".update-components-actor__name span[aria-hidden='true'], .feed-shared-actor__name",
        );

        // author profile url
        const authorUrlEl = item.querySelector(
          ".update-components-actor__meta-link, .feed-shared-actor__container-link",
        ) as HTMLAnchorElement;

        // post content text
        const contentEl = item.querySelector(
          ".feed-shared-update-v2__description, .update-components-text",
        );

        // data attribute LinkedIn puts on each post
        const postId =
          item.getAttribute("data-urn") || item.getAttribute("data-id") || null;

        // post url — try to find the timestamp/permalnk link, or construct from postId
        const postUrlEl = item.querySelector(
          'a[href*="/feed/update/"], ' +
            'a[href*="/posts/"], ' +
            ".update-components-actor__sub-description a, " +
            ".feed-shared-actor__sub-description a",
        ) as HTMLAnchorElement;
        const postUrl =
          postUrlEl?.href ||
          (postId ? `https://www.linkedin.com/feed/update/${postId}/` : null);

        return {
          postId,
          author: authorEl?.textContent?.trim() || null,
          authorUrl: authorUrlEl?.href || null,
          content: contentEl?.textContent?.trim() || null,
          postUrl,
          reactionType: "like", // default, hard to extract specific reaction type
          scrapedAt: new Date().toISOString(),
        };
      });
    });

    // only add posts we haven't seen yet
    const existingIds = new Set(posts.map((p) => p.postId));
    const uniqueNew = newPosts.filter(
      (p) => p.postId && !existingIds.has(p.postId),
    );
    posts.push(...uniqueNew);

    console.log(
      `📦 Collected ${posts.length} posts so far (${uniqueNew.length} new this scroll)...`,
    );

    // scroll down
    const currentHeight = await page.evaluate(() => {
      window.scrollBy(0, 800);
      return document.body.scrollHeight;
    });

    await humanDelay(1500, 2500);

    if (currentHeight === previousHeight) {
      noChangeCount++;
      console.log(`⚠️  No new content loaded (attempt ${noChangeCount}/3)`);
    } else {
      noChangeCount = 0;
      previousHeight = currentHeight;
    }
  }

  console.log(`✅ Done. Total posts scraped: ${posts.length}`);

  // save to file for now (before DB integration)
  await mkdir("./data", { recursive: true });
  await writeFile("./data/linkedin-likes.json", JSON.stringify(posts, null, 2));
  console.log("💾 Saved to data/linkedin-likes.json");

  await browser.close();
  return posts;
}

// run directly
scrapeLinkedInLikes().catch(console.error);
