const cheerio = require('cheerio');

async function debug(url) {
    console.log('Fetching:', url);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    console.log('\n=== og:image ===');
    console.log($('meta[property="og:image"]').attr('content'));

    console.log('\n=== Content selectors present ===');
    ['.vndetails', '.td-post-content', '.post-content', 'article', '[role="main"]'].forEach(sel => {
        const count = $(sel).length;
        const imgCount = $(`${sel} img`).length;
        console.log(`  ${sel}: exists=${count > 0}, imgs=${imgCount}`);
    });

    console.log('\n=== ALL imgs in .td-post-content (first 25) ===');
    $('.td-post-content img').each((i, el) => {
        if (i >= 25) return;
        const $img = $(el);
        const src = $img.attr('src') || '';
        const dataSrc = $img.attr('data-src') || '';
        const dataImgUrl = $img.attr('data-img-url') || '';
        const dataLazySrc = $img.attr('data-lazy-src') || '';
        const dataOriginal = $img.attr('data-original') || '';
        const width = $img.attr('width') || '?';
        const height = $img.attr('height') || '?';
        const parentTag = $img.parent().prop('tagName') || '';
        const parentClass = $img.parent().attr('class') || '';

        console.log(`\n  IMG[${i}] w=${width} h=${height} parent=<${parentTag} class="${parentClass}">`);
        console.log(`    src          = ${src.substring(0, 120)}`);
        if (dataSrc) console.log(`    data-src     = ${dataSrc.substring(0, 120)}`);
        if (dataImgUrl) console.log(`    data-img-url = ${dataImgUrl.substring(0, 120)}`);
        if (dataLazySrc) console.log(`    data-lazy-src= ${dataLazySrc.substring(0, 120)}`);
        if (dataOriginal) console.log(`    data-original= ${dataOriginal.substring(0, 120)}`);
    });

    console.log('\n=== Skip container check (first 10 imgs in .td-post-content) ===');
    const skipSel = ['.td-module-thumb', '.td-related-span', '.td-related-title', '.td-sidebar', '#sidebar', '.td-header-wrap', 'header', 'footer', 'nav', '.td-footer-wrapper', '.td-ss-main-sidebar'].join(', ');
    $('.td-post-content img').each((i, el) => {
        if (i >= 10) return;
        const $img = $(el);
        const inSkip = $img.closest(skipSel).length > 0;
        const src = ($img.attr('src') || '').substring(0, 80);
        console.log(`  IMG[${i}]: inSkip=${inSkip} src=${src}`);
    });
}

const url = process.argv[2];
if (!url) { console.error('Usage: node debug_html.js <url>'); process.exit(1); }
debug(url).catch(console.error);
