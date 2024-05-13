const puppeteer = require('puppeteer');

async function scrapeExito(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto(`https://www.exito.com/s?q=${encodeURIComponent(searchQuery)}`)
    await page.waitForSelector('.product-grid_fs-product-grid___qKN2', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        const productCards = document.querySelectorAll('.product-card-no-alimentos_fsProductCardNoAlimentos__zw867');
        return Array.from(productCards).map(card => {
            const title = card.querySelector('h3 a') ? card.querySelector('h3 a').innerText : 'No title available';
            const price = card.querySelector('.ProductPrice_container__price__XmMWA') ? card.querySelector('.ProductPrice_container__price__XmMWA').innerText.replace(/\D/g, '') : 'No price available';
            const link = card.querySelector('.link_fs-link__J1sGD') ? card.querySelector('.link_fs-link__J1sGD').href : 'No link available';
            const imageUrl = card.querySelector('.imagen_plp') ? card.querySelector('.imagen_plp').src : 'No image available';
            return { title, price, link, imageUrl };
        })
            .filter(item => item && item.title.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => a.price - b.price)
            .slice(0, 3);
    }, searchQuery);
    await browser.close();
    return filteredProducts;
}

module.exports = scrapeExito;
