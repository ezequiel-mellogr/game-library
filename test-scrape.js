const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ryuugames.html', 'utf8');
const $ = cheerio.load(html);

let desc = [];

$('.vndetails p').each((_, el) => {
    const text = $(el).text().trim();
    const htmlContent = $(el).html();

    // Check if paragraph contains an image wrapper (it has style text-align: center)
    const isImageGallery = $(el).find('img').length > 0 || $(el).attr('style')?.includes('text-align: center');
    // Check if it's the download links paragraph
    const isDownloadLinks = text.toUpperCase().includes('LINK DOWNLOAD');

    if (text.length > 0 && !isImageGallery && !isDownloadLinks) {
        desc.push(text);
    }
});

console.log("--- Extracted Description ---");
console.log(desc.join('\n\n'));
