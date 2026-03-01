const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
    const url = 'https://www.ryuugames.com/eng-tsuushinbo-another-story-disc-hitori-de-dekiru-mon-himitsu-no-yoshuu-free-download/';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const result = {
        og_image: $('meta[property="og:image"]').attr('content') || null,
        selectors: {},
        imgs: []
    };

    ['.vndetails', '.td-post-content', '.post-content', 'article'].forEach(s => {
        result.selectors[s] = { found: $(s).length, imgs: $(s + ' img').length };
    });

    let i = 0;
    $('.td-post-content img').each((_, el) => {
        if (i >= 25) return;
        i++;
        const img = $(el);
        result.imgs.push({
            src: img.attr('src') || null,
            data_src: img.attr('data-src') || null,
            data_img_url: img.attr('data-img-url') || null,
            data_lazy_src: img.attr('data-lazy-src') || null,
            data_original: img.attr('data-original') || null,
            width: img.attr('width') || null,
            height: img.attr('height') || null,
            parent_class: img.parent().attr('class') || img.parent().prop('tagName') || null,
        });
    });

    fs.writeFileSync('C:/tmp/ryuu_debug.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('Written to C:/tmp/ryuu_debug.json');
}

run().catch(e => { console.error('ERROR:', e.message); });
