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

        // Helper: add valid screenshot URL (avoid dupes, placeholders, and cover image)
        const addScreenshot = (imgUrl: string | undefined) => {
            if (!imgUrl) return;
            if (imgUrl.startsWith('data:')) return;
            if (seenUrls.has(imgUrl)) return;
            // Skip the cover/og image — it's already shown separately
            if (coverImageUrl && imgUrl === coverImageUrl) return;
            // Only allow http(s), skip icons/gifs/svgs
            if (!/^https?:\/\//.test(imgUrl)) return;
            if (/\.(ico|gif|svg)(\?|$)/i.test(imgUrl)) return;
            // Skip images that are very likely to be site UI (logos, avatars, banners)
            // by checking common URL patterns
            const lowerUrl = imgUrl.toLowerCase();
            if (lowerUrl.includes('/avatar') || lowerUrl.includes('/logo') || lowerUrl.includes('/banner') || lowerUrl.includes('/icon') || lowerUrl.includes('gravatar.com')) return;
            seenUrls.add(imgUrl);
            extractedScreenshots.push(imgUrl);
        };

        // Containers that are known to hold only navigation/UI images — skip these entirely
        const skipContainerSelector = [
            '.td-module-thumb',
            '.td-related-span',
            '.td-related-title',
            '.td-sidebar',
            '#sidebar',
            '.widget',
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
                // Skip very small images (likely icons/thumbnails) by checking width/height attrs
                const width = parseInt($img.attr('width') || '0', 10);
                const height = parseInt($img.attr('height') || '0', 10);
                if ((width > 0 && width < 200) || (height > 0 && height < 150)) return;
                const src = $img.attr('src');
                const dataImg = $img.attr('data-img-url') || $img.attr('data-src') || $img.attr('data-lazy-src');
                // Prefer lazy-load source over placeholder data URI
                const resolvedSrc = src?.startsWith('data:') ? dataImg : src;
                addScreenshot(resolvedSrc);
                // Also add the data-img-url variant if different
                if (dataImg && dataImg !== resolvedSrc) addScreenshot(dataImg);
            });
            if (extractedScreenshots.length > 0) break;
        }

        // Fallback: og:image only if still nothing found AND it differs from cover
        if (extractedScreenshots.length === 0) {
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage && ogImage !== coverImageUrl) addScreenshot(ogImage);
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
