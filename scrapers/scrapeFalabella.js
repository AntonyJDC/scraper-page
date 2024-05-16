const puppeteer = require('puppeteer');

async function scrapeFalabella(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto(`https://www.falabella.com.co/falabella-co/search/?Ntt=${encodeURIComponent(searchQuery)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.pod', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        const productCards = document.querySelectorAll('.pod');
        const limitedProducts = Array.from(productCards).slice(0, 5).map(card => { 
            const title = card.querySelector('b[id^="testId-pod-displaySubTitle"]') ? card.querySelector('b[id^="testId-pod-displaySubTitle"]').innerText : 'No title available';
            const priceElement = card.querySelector('.copy10');
            const price = priceElement ? priceElement.innerText.replace(/\D/g, '') : 'No price available';
            const imageUrl = card.querySelector('picture img') ? card.querySelector('picture img').src : 'No image available';
            const link = card.querySelector('a[id^="testId-pod"]') ? card.querySelector('a[id^="testId-pod"]').href : 'No link available';
            return { title, price, link, imageUrl, storeName: 'Falabella' };
        });

        return limitedProducts.sort((a, b) => a.price - b.price).slice(0, 3);
    }, searchQuery);
    await browser.close();
    return filteredProducts;
}

module.exports = scrapeFalabella;
