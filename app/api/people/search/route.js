// /api/people/search/index.js
import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table_name') || 'usa';
  const searchColumn = searchParams.get('search_column') || '';
  const searchValue = searchParams.get('search_value') || '';
  const limit = parseInt(searchParams.get('limit')) || 50;
  const offset = parseInt(searchParams.get('offset')) || 0;
  const filters = searchParams.get('filters') ? JSON.parse(searchParams.get('filters')) : {};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('search_table', {
      p_table_name: tableName,
      search_column: searchColumn,
      search_value: searchValue,
      filters: filters,
      fetch_limit: limit,
      fetch_offset: offset,
    });

    if (error) {
      console.error('Error fetching data:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
