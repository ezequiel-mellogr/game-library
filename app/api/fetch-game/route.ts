import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
        const response = await fetch(microlinkUrl);

        if (!response.ok) {
            throw new Error(`Microlink API responded with status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            return NextResponse.json({
                title: data.data.title || '',
                description: data.data.description || '',
                image_url: data.data.image?.url || null,
                original_url: data.data.url || url,
            });
        } else {
            return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error fetching game data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
