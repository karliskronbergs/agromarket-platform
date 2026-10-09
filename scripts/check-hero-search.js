const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/lv", { waitUntil: "networkidle" });

  async function clickVisible(text) {
    const matches = page.getByText(text, { exact: true });
    const n = await matches.count();
    for (let i = 0; i < n; i++) {
      if (await matches.nth(i).isVisible()) {
        await matches.nth(i).click();
        return;
      }
    }
    throw new Error(`No visible match for "${text}"`);
  }

  await clickVisible("Pārdod");
  const inputs = page.getByPlaceholder("Meklēt sludinājumus...");
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    if (await inputs.nth(i).isVisible()) {
      await inputs.nth(i).fill("traktors");
      break;
    }
  }
  await clickVisible("Meklēt");
  await page.waitForURL(/\/map/, { timeout: 5000 });
  console.log("Navigated to:", page.url());
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
