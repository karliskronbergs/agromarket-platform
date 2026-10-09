const { chromium } = require("playwright");

async function main() {
  const [url, width, selector] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: parseInt(width, 10), height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const fontSize = await page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontSize);
  console.log(`${url} @ ${width}px -> ${selector}: ${fontSize}`);
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
