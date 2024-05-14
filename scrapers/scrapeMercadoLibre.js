const puppeteer = require('puppeteer');

async function scrapeMercadoLibre(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto('https://listado.mercadolibre.com.co/' + encodeURIComponent(searchQuery), { waitUntil: 'networkidle0' });
    await page.waitForSelector('.ui-search-result__wrapper', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        const productCards = document.querySelectorAll('.ui-search-result__wrapper');
        return Array.from(productCards).map(card => {
            const title = card.querySelector('.ui-search-item__title') ? card.querySelector('.ui-search-item__title').innerText : 'No title available';
            const price = card.querySelector('.ui-search-price__second-line .andes-money-amount__fraction') ? card.querySelector('.ui-search-price__second-line .andes-money-amount__fraction').innerText.replace(/\D/g, '') : 'No price available';
            const link = card.querySelector('.ui-search-link') ? card.querySelector('.ui-search-link').href : 'Link no available';
            const imageUrl = card.querySelector('img.ui-search-result-image__element') ? card.querySelector('img.ui-search-result-image__element').src : 'No image available';
            const conditionElement = card.querySelector('.ui-search-item__group__element.ui-search-item__details');
            const storeName = 'MercadoLibre';
            if (conditionElement && conditionElement.innerText.toLowerCase().includes('usado')) {
                return null;
            }

            return { title, price, link, imageUrl, storeName};

        })
            .filter(item => item && item.title.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => a.price - b.price)
            .slice(0, 3);
    }, searchQuery);

    await browser.close();
    return filteredProducts;
}

module.exports = scrapeMercadoLibre;
