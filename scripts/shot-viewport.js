// Viewport-only screenshot (no fullPage stitching) scrolled to the bottom,
// to sanity-check fixed-position elements like the mobile tab bar.
const { chromium } = require("playwright");

async function main() {
  const [url, widthStr, heightStr, outfile, ...rest] = process.argv.slice(2);
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  const clicks = [];
  const noScroll = rest.includes("--no-scroll");
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--click") clicks.push(rest[i + 1]);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  for (const text of clicks) {
    await page.getByText(text, { exact: true }).first().click();
    await page.waitForTimeout(400);
  }
  if (!noScroll) await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.screenshot({ path: outfile });
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
