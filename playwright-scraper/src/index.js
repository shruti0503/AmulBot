// filepath: /playwright-scraper/playwright-scraper/src/index.js
const { chromium } = require('playwright');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { isProductInStock, getProductName } = require('./utils/scraper');
require('dotenv').config();

const productUrls = [
  'https://shop.amul.com/en/product/amul-high-protein-paneer-400-g-or-pack-of-24',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-vanilla-180-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-chocolate-whey-protein-34-g-or-pack-of-60-sachets',
  'https://shop.amul.com/en/product/amul-whey-protein-32-g-or-pack-of-30-sachets',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-vanilla-180-ml-or-pack-of-8',
  'https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-chocolate-whey-protein-gift-pack-34-g-or-pack-of-10-sachets',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-kesar-180-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-kesar-180-ml-or-pack-of-8',
  'https://shop.amul.com/en/product/amul-high-protein-blueberry-shake-200-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-kesar-180-ml-or-pack-of-30'
];

// in stock 
// out of stock 


async function sendStockNotification(inStockProducts) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const productListHtml = inStockProducts.map(p => 
      `<li><a href="${p.url}" target="_blank"></a></li>`
    ).join('\n');
    const productListText = inStockProducts.map(p => `${p.url}`).join('\n');
    await transporter.sendMail({
      from: `"Amul Stock Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: 'Amul Protein Products In Stock!',
      text: `These Amul protein products are currently in stock:\n\n${productListText}`,
      html: `<p>These <b>Amul protein products</b> are currently <b>IN STOCK</b>:</p><ul>${productListHtml}</ul>`,
    });
    console.log('Notification email sent.');
  } catch (err) {
    console.error('Failed to send email notification:', err.message);
  }
}



const checkStocks=async()=>{
  const inStocks=[];
  const browser = await chromium.launch({headless:false});
  const context = await browser.newContext();
  const page = await context.newPage();


  for (const url of productUrls) {
    const inStock = await isProductInStock( url);
    console.log(` - ${url} is ${inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
    if (inStock) {
      inStocks.push({url:url});
      //const name = await getProductName( url, context);
     // console.log(`Product in stock: ${name}`);
    }
  }
  await browser.close();
  return inStocks;

}

cron.schedule('* * * * *', async () => {
  const prods=await checkStocks();
  await sendStockNotification(prods);
});
