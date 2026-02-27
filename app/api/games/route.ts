import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NewGame } from '@/lib/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase.from('games').select('*').order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const gameData: NewGame = await request.json();

        const { data, error } = await supabase
            .from('games')
            .insert([gameData])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
}
