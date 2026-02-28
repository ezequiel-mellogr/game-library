import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;

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
        let extractedDownloadLink: string | null = null;
        let extractedDescription: string = '';

        // Custom Scraping logic (specifically for Ryuugames and similar visual novel sites)
        $('.vndetails img').each((_, el) => {
            const src = $(el).attr('src');
            // Basic validation to save valid image URLs
            if (src && /^https?:\/\//.test(src)) {
                extractedScreenshots.push(src);
            }
        });

        $('a').each((_, el) => {
            const text = $(el).text().toUpperCase();
            const href = $(el).attr('href');
            if (text.includes('MEDIAFIRE') && href) {
                extractedDownloadLink = href;
            }
        });

        // Extract Description from Ryuugames format
        let rawDesc: string[] = [];
        $('.vndetails p').each((_, el) => {
            const text = $(el).text().trim();
            // Check if paragraph contains an image wrapper (it has style text-align: center)
            const isImageGallery = $(el).find('img').length > 0 || $(el).attr('style')?.includes('text-align: center');
            // Check if it's the download links paragraph
            const isDownloadLinks = text.toUpperCase().includes('LINK DOWNLOAD') || text.toUpperCase().includes('PASSWORD');

            if (text.length > 0 && !isImageGallery && !isDownloadLinks) {
                rawDesc.push(text);
            }
        });
        extractedDescription = rawDesc.join('\n\n');

        if (data.status === 'success') {
            return NextResponse.json({
                title: data.data.title || $('title').text() || '',
                description: extractedDescription || data.data.description || $('meta[name="description"]').attr('content') || '',
                image_url: data.data.image?.url || null,
                original_url: data.data.url || url,
                screenshots: extractedScreenshots.length > 0 ? extractedScreenshots.slice(0, 10) : [],
                download_link: extractedDownloadLink || null
            });
        } else {
            return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error fetching game data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
