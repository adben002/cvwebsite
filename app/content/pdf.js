const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');

async function printPDF() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/index-' + process.env.buildId + '.html', {waitUntil: 'networkidle0'});
    await page.addStyleTag({content: '.export-hidden {display: none}'});
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {top: '1cm', bottom: '1cm', right: '1cm', left: '1cm'}
    });

    await browser.close();
    return pdf
}

const app = express();
const port = 3000;
app.use('/', express.static('dist'));
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

printPDF()
    .then(pdf => fs.writeFileSync("dist/" + process.env.buildId + "/AdamBennettCV.pdf", pdf, 'binary'))
    .then(() => server.close());