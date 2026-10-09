// One-off visual QA helper (not part of the app). Usage:
//   node scripts/shot.js <url> <width> <outfile> [--mobile-frame] [--click "Text"]... [--wait-text "Text"] [--scroll-top]
const { chromium } = require("playwright");

async function main() {
  const [url, widthStr, outfile, ...rest] = process.argv.slice(2);
  const width = parseInt(widthStr, 10);
  const mobileFrame = rest.includes("--mobile-frame");
  const clicks = [];
  const scrollTop = rest.includes("--scroll-top");
  let waitText = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--click") clicks.push(rest[i + 1]);
    if (rest[i] === "--wait-text") waitText = rest[i + 1];
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(url, { waitUntil: "networkidle" });

  try {
    await page.waitForSelector('img[alt="lauks24.lv"]', { timeout: 5000 });
  } catch {
    // real app pages without the logo (e.g. isolated components) - ignore
  }
  await page.waitForTimeout(500);

  for (const text of clicks) {
    const loc = page.getByText(text, { exact: true }).first();
    await loc.click();
    await page.waitForTimeout(500);
  }

  if (waitText) {
    await page.waitForSelector(`text=${waitText}`, { timeout: 5000 }).catch(() => {});
  }

  if (mobileFrame) {
    // The mobile prototype renders a fixed-size phone mockup (410x864 outer
    // bezel, 390x844 inner "screen" with internal scroll). For a fair
    // comparison against the real site's full responsive page, unlock the
    // screen's height so it lays out at full content height instead of
    // clipping to the phone's physical screen size.
    const handle = await page.evaluateHandle(() => {
      const divs = Array.from(document.querySelectorAll("div"));
      const screen = divs.find(
        (d) => d.style.width === "390px" && d.style.height === "844px"
      );
      if (!screen) return null;
      const scrollChild = Array.from(screen.children).find(
        (c) => getComputedStyle(c).overflowY === "auto"
      );
      screen.style.height = "auto";
      if (scrollChild) {
        scrollChild.style.flex = "none";
        scrollChild.style.height = "auto";
        scrollChild.style.overflow = "visible";
      }
      return screen;
    });
    const el = handle.asElement();
    if (el) {
      await el.screenshot({ path: outfile });
    } else {
      await page.screenshot({ path: outfile, fullPage: true });
    }
  } else {
    if (scrollTop) await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: outfile, fullPage: true });
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
