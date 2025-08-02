const { chromium } = require('playwright');

async function isProductInStock(productUrl) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    //console.log("productUrl", productUrl);
    await page.goto(productUrl);

   // const text = await page.textContent('body');
    await page.waitForSelector('#search');
    await page.fill('#search', '124507');
    (await page.waitForSelector('.searchitem-name')).click();
    await page.waitForTimeout(2000);

    try {
      notifyContent = await page.waitForSelector('.product-enquiry-wrap', { timeout: 3000 }); // 3 seconds
    } catch (e) {
      return true;
    }
    return false;
   
    //  const text = await page.textContent('body');
    // // console.log("productTitle", productTitle, notifyTitle);
    // const keywords = ['sold out', 'notify me', 'out of stock'];
    // const found = keywords.some(kw => text.toLowerCase().includes(kw));
    //  console.log("text",text, found, ) ;
    // require('fs').writeFileSync('page.html', text);
    
    //return !found;

  } catch (err) {
    console.error(`Error checking stock for ${productUrl}:`, err.message);
    return false;
  } finally {
    if (browser) await browser.close();
  }
}

async function getProductName(url) {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    
    let title = await page.textContent('h1') || await page.title();
    title = title.trim();
    
    await browser.close();
    return title || url;
  } catch {
    return url;
  }
}

module.exports = {
  isProductInStock,
  getProductName,
};