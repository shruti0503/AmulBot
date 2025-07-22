const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const productUrls = [
  'https://shop.amul.com/en/product/amul-chocolate-whey-protein-34-g-or-pack-of-60-sachets',
  'https://shop.amul.com/en/product/amul-whey-protein-32-g-or-pack-of-30-sachets',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-vanilla-180-ml-or-pack-of-8',
  'https://shop.amul.com/en/product/amul-high-protein-plain-lassi-200-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-chocolate-whey-protein-gift-pack-34-g-or-pack-of-10-sachets',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-kesar-180-ml-or-pack-of-30',
  'https://shop.amul.com/en/product/amul-kool-protein-milkshake-or-kesar-180-ml-or-pack-of-8',
  'https://shop.amul.com/en/product/amul-high-protein-blueberry-shake-200-ml-or-pack-of-30'
];

// Function to check if a single product is in stock
async function isProductInStock(productUrl) {
  try {
    const { data } = await axios.get(productUrl);
    const $ = cheerio.load(data);

    const soldOutContains = $('*').filter((i, el) => {
        return $(el).text().toLowerCase().includes('sold out');
    });


    // If none found, product is in stock
    return soldOutContains.length !== 0;
  } catch (err) {
    console.error(`Error checking stock for ${productUrl}:`, err.message);
    return false; 
  }
}


async function sendStockNotification(inStockProducts) {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const productListHtml = inStockProducts.map(p => 
      `<li><a href="${p.url}" target="_blank">${p.name}</a></li>`
    ).join('\n');

    const productListText = inStockProducts.map(p => `${p.name}: ${p.url}`).join('\n');

    let info = await transporter.sendMail({
      from: `"Amul Stock Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: 'Amul Protein Products In Stock!',
      text: `These Amul protein products are currently in stock:\n\n${productListText}`,
      html: `<p>These <b>Amul protein products</b> are currently <b>IN STOCK</b>:</p><ul>${productListHtml}</ul>`,
    });

    console.log('Notification email sent:', info.response);
  } catch (err) {
    console.error('Failed to send email notification:', err.message);
  }
}


async function getProductName(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

   
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }
    return title || url;
  } catch {
    return url;
  }
}

let notifiedProducts = new Set();

cron.schedule('* * * * *', async () => {
  console.log(`[${new Date().toLocaleString()}] Checking stock...`);

  const inStockProducts = [];

  for (const url of productUrls) {
    const inStock = await isProductInStock(url);
    console.log(` - ${url} is ${inStock ? 'OUT OF STOCK' : 'IN STOCK'}`);

    if (!inStock) {
      // Get product name for nicer email
      const name = await getProductName(url);
      inStockProducts.push({ url, name });
    }
  }

  if (inStockProducts.length > 0) {
    // To avoid repeat emails for same products, compare sets
    const inStockUrls = new Set(inStockProducts.map(p => p.url));

   
    const newInStock = [...inStockUrls].filter(u => !notifiedProducts.has(u));

    if (newInStock.length > 0) {
     
      const productsToNotify = inStockProducts.filter(p => newInStock.includes(p.url));
      await sendStockNotification(productsToNotify);
  
      notifiedProducts = new Set([...notifiedProducts, ...newInStock]);
    } else {
      console.log('No new products in stock since last notification.');
    }
  } else {
    // Reset notified list if none in stock
    if (notifiedProducts.size > 0) {
      console.log('No products in stock, resetting notified products list.');
      notifiedProducts.clear();
    } else {
      console.log('No products in stock.');
    }
  }
});

app.get('/', (req, res) => {
  res.send('Amul stock notifier bot is running!');
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
