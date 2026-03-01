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

        // Helper: add valid screenshot URL (avoid dupes and placeholders)
        const addScreenshot = (url: string | undefined) => {
            if (!url || url.startsWith('data:') || seenUrls.has(url)) return;
            if (/^https?:\/\//.test(url) && !/\.(ico|gif|svg)(\?|$)/i.test(url)) {
                seenUrls.add(url);
                extractedScreenshots.push(url);
            }
        };

        // Screenshots: múltiples selectores para distintos formatos de Ryuugames y otros sitios
        const contentSelectors = ['.vndetails', '.td-post-content', '.post-content', 'article', '[role="main"]'];
        for (const selector of contentSelectors) {
            $(`${selector} img`).each((_, el) => {
                const $img = $(el);
                // Evitar thumbnails de posts relacionados (218x150)
                if ($img.closest('.td-module-thumb, .td-related-span').length) return;
                const src = $img.attr('src');
                const dataImg = $img.attr('data-img-url') || $img.attr('data-src');
                addScreenshot(src?.startsWith('data:') ? dataImg : src);
            });
        }

        // Fallback: og:image si no hay capturas
        if (extractedScreenshots.length === 0) {
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) addScreenshot(ogImage);
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
