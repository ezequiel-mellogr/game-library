import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        console.log('--- FETCH GAME API START ---');
        console.log('Target URL:', url);
        // Add a timestamp to avoid caching
        const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&t=${Date.now()}`;

        // Fetch from Microlink and the direct URL simultaneously
        const [microlinkRes, rawRes] = await Promise.all([
            fetch(microlinkUrl),
            fetch(url)
        ]);

        if (!microlinkRes.ok) {
            throw new Error(`Microlink API responded with status ${microlinkRes.status}`);
        }

        const data = await microlinkRes.json();
        const html = await rawRes.text();
        const $ = cheerio.load(html);

        let extractedScreenshots: string[] = [];
        const seenUrls = new Set<string>();
        let extractedDownloadLink: string | null = null;
        let extractedDescription: string = '';

        // The cover image returned by Microlink — we want to EXCLUDE this from screenshots
        const coverImageUrl = data.status === 'success' ? (data.data.image?.url || null) : null;

        // Also grab the og:image to use for exclusion comparison
        const ogImageUrl = $('meta[property="og:image"]').attr('content') || null;

        // Helper: add valid screenshot URL (avoid dupes, placeholders, and cover image)
        const addScreenshot = (imgUrl: string | undefined) => {
            if (!imgUrl) return;
            if (imgUrl.startsWith('data:')) return;
            if (seenUrls.has(imgUrl)) return;
            // Only allow http(s), skip icons/svgs (allow gif — some screenshots are gifs)
            if (!/^https?:\/\//.test(imgUrl)) return;
            if (/\.(ico|svg)(\?|$)/i.test(imgUrl)) return;
            // Skip the cover/og image — it's already shown separately as image_url
            if (coverImageUrl && imgUrl === coverImageUrl) return;
            if (ogImageUrl && imgUrl === ogImageUrl) return;
            seenUrls.add(imgUrl);
            extractedScreenshots.push(imgUrl);
        };

        // Resolve the real image URL from a lazy-loaded img element.
        // WordPress sites use data-img-url, data-src, or data-lazy-src.
        // The src attr may be a tiny 1x1 GIF placeholder or a data URI.
        const resolveImgSrc = ($img: ReturnType<typeof $>): string => {
            const src = $img.attr('src') || '';
            const lazySrc =
                $img.attr('data-img-url') ||
                $img.attr('data-src') ||
                $img.attr('data-lazy-src') ||
                $img.attr('data-original') || '';
            // If src is a placeholder (data URI, a 1×1 gif, or ends in .gif), use lazySrc
            if (src.startsWith('data:') || /1x1|placeholder|blank/i.test(src) || src.endsWith('.gif')) {
                return lazySrc || src;
            }
            return src || lazySrc;
        };

        // Containers that hold only navigation/UI images — skip images inside these
        const skipContainerSelector = [
            '.td-module-thumb',
            '.td-related-span',
            '.td-related-title',
            '.td-sidebar',
            '#sidebar',
            '.td-header-wrap',
            'header',
            'footer',
            'nav',
            '.td-footer-wrapper',
            '.td-ss-main-sidebar',
        ].join(', ');

        // Screenshot selectors ordered from most to least specific
        const contentSelectors = ['.vndetails', '.td-post-content', '.post-content', 'article', '[role="main"]'];
        for (const selector of contentSelectors) {
            $(`${selector} img`).each((_, el) => {
                const $img = $(el);
                // Skip images inside navigation/sidebar/related-post containers
                if ($img.closest(skipContainerSelector).length) return;
                // Skip very small images (likely icons/avatars) — only if explicit attr < 100px
                const width = parseInt($img.attr('width') || '0', 10);
                const height = parseInt($img.attr('height') || '0', 10);
                if ((width > 0 && width < 100) || (height > 0 && height < 100)) return;

                addScreenshot(resolveImgSrc($img));
            });
            if (extractedScreenshots.length > 0) break;
        }

        // Fallback: og:image only if still nothing found AND it differs from cover
        if (extractedScreenshots.length === 0) {
            if (ogImageUrl && ogImageUrl !== coverImageUrl) addScreenshot(ogImageUrl);
        }

        $('a').each((_, el) => {
            const text = $(el).text().toUpperCase();
            const href = $(el).attr('href');
            if (text.includes('MEDIAFIRE') && href) {
                extractedDownloadLink = href;
            }
        });

        // Description: múltiples selectores y fallbacks
        let rawDesc: string[] = [];
        const descSelectors = ['.vndetails p', '.td-post-content p', '.post-content p', 'article p'];

        for (const selector of descSelectors) {
            $(selector).each((_, el) => {
                const text = $(el).text().trim();
                const isImageGallery = $(el).find('img').length > 0 || $(el).attr('style')?.includes('text-align: center');
                const isDownloadLinks = text.toUpperCase().includes('LINK DOWNLOAD') || text.toUpperCase().includes('PASSWORD');
                const isIrrelevant = text.toUpperCase().includes('RYUUGAMES') ||
                    text.toUpperCase().includes('FOLLOW US') ||
                    text.toUpperCase().includes('COMMENT');

                if (text.length > 50 && !isImageGallery && !isDownloadLinks && !isIrrelevant) {
                    rawDesc.push(text);
                }
            });
            if (rawDesc.length > 0) break;
        }

        // Fallback: párrafos largos en toda la página
        if (rawDesc.length === 0) {
            $('p').each((_, el) => {
                const text = $(el).text().trim();
                const isIrrelevant = text.toUpperCase().includes('RYUUGAMES') ||
                    text.toUpperCase().includes('FOLLOW US') ||
                    text.toUpperCase().includes('COMMENT') ||
                    text.toUpperCase().includes('PASSWORD');

                if (text.length > 80 && !isIrrelevant) {
                    rawDesc.push(text);
                }
            });
        }
        extractedDescription = rawDesc.join('\n\n');

        console.log('Extracted Screenshots Count:', extractedScreenshots.length);
        console.log('Extracted Download Link:', extractedDownloadLink);
        console.log('Extracted Description Length:', extractedDescription.length);

        if (data.status === 'success') {
            const finalData = {
                title: data.data.title || $('title').text() || '',
                // Prioritize the long description from Cheerio
                description: extractedDescription || data.data.description || $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
                image_url: data.data.image?.url || null,
                original_url: data.data.url || url,
                screenshots: extractedScreenshots.length > 0 ? extractedScreenshots.slice(0, 10) : [],
                download_link: extractedDownloadLink || null
            };
            console.log('Final Description Length:', finalData.description?.length);
            console.log('Sending JSON response...');
            return NextResponse.json(finalData, {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                }
            });
        } else {
            return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error fetching game data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
