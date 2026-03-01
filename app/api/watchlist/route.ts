import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NewWatchItem } from '@/lib/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase.from('watchlist').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }
    if (type && type !== 'all') {
        query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body: NewWatchItem = await request.json();

        const { data, error } = await supabase
            .from('watchlist')
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error('Supabase watchlist insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Watchlist POST error:', error);
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}
