// /api/people/columns/index.js
import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table_name') || 'usa';

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName });

    if (error) {
      console.error('Error fetching columns:', error);
      return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
    }

    return NextResponse.json({ columns: data.map((row) => row.col_name) });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
