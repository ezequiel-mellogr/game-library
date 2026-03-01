const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('problem_game.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- HTML STRUCTURE ANALYSYS ---');
console.log('Title:', $('title').text());

console.log('\n--- VNDETAILS CONTENT ---');
$('.vndetails p').each((i, el) => {
    const text = $(el).text().trim();
    const hasImg = $(el).find('img').length > 0;
    const style = $(el).attr('style') || 'no style';
    console.log(`P[${i}] (hasImg: ${hasImg}, style: ${style}): ${text.substring(0, 100)}...`);
});

console.log('\n--- SEARCHING FOR STORY TEXT ---');
// Try to find text that looks like a story
$('p').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length > 200) {
        console.log(`Found long P[${i}]: ${text.substring(0, 100)}...`);
    }
});
