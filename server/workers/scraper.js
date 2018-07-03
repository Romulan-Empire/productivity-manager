const puppeteer = require('puppeteer');
const db = require('../database/scraper.js');

function sleep(ms) {
  return new Promise(resolve => {
      setTimeout(resolve,ms)
  })
}

const scrapeYoutubeTitles = async (url, prod_class, headless) => {
  const browser = await puppeteer.launch({headless: headless})
  const page = await browser.newPage()
  await page.goto(url)
  for (let i = 0; i < 200; i++) {
    page.keyboard.down("PageDown");
    page.keyboard.up("PageDown")
    await sleep(200);
  }

  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    let titles = [];
    const elements = document.querySelectorAll('#video-title');
    for (let element of elements) {
      const title = element.innerText;
      titles.push(title);
    }
    return titles;
  });

  await browser.close();
  console.log(result)
  db.addScrapingResults(result, prod_class);
}

const scrapeMediumTitles = async (url, prod_class, headless = true) => {
  const browser = await puppeteer.launch({headless: headless})
  const page = await browser.newPage()
  await page.goto(url)
  for (let i = 0; i < 400; i++) {
    page.keyboard.down("PageDown");
    page.keyboard.up("PageDown")
    await sleep(200);
  }

  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    let titles = [];
    const className = '.graf--title'
    const elements = document.querySelectorAll(className);
    for (let element of elements) {
      const title = element.innerText;
      titles.push(title);
    }
    return titles;
  });

  await browser.close();
  db.addScrapingResults({titles: result, prod_class, url});
}


const url = 'https://medium.com/front-end-hacking/tagged/javascript';
const prod_class = 'productive';
scrapeMediumTitles(url, prod_class, true);
