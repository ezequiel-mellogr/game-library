const cheerio = require('cheerio');

async function run() {
    const url = 'https://www.ryuugames.com/eng-tsuushinbo-another-story-disc-hitori-de-dekiru-mon-himitsu-no-yoshuu-free-download/';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImg = $('meta[property="og:image"]').attr('content');
    console.log('OG_IMAGE:', ogImg || 'none');

    const selectors = ['.vndetails', '.td-post-content', '.post-content', 'article'];
    selectors.forEach(s => {
        console.log(s + ': found=' + $(s).length + ' imgs=' + $(s + ' img').length);
    });

    console.log('\n--- IMGS in .td-post-content ---');
    let i = 0;
    $('.td-post-content img').each((_, el) => {
        if (i >= 20) return;
        i++;
        const img = $(el);
        const src = (img.attr('src') || '').slice(0, 120);
        const ds = (img.attr('data-src') || '').slice(0, 120);
        const diu = (img.attr('data-img-url') || '').slice(0, 120);
        const dls = (img.attr('data-lazy-src') || '').slice(0, 120);
        const w = img.attr('width') || 'none';
        const h = img.attr('height') || 'none';
        const pc = (img.parent().attr('class') || img.parent().prop('tagName') || '');
        console.log('IMG[' + i + '] w=' + w + ' h=' + h + ' parent=' + pc);
        console.log('  src=' + src);
        if (ds) console.log('  data-src=' + ds);
        if (diu) console.log('  data-img-url=' + diu);
        if (dls) console.log('  data-lazy-src=' + dls);
    });
}

run().catch(e => console.error('ERROR:', e.message));
