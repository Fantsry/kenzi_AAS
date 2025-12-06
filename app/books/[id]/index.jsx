import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../../lib/db';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    if (books.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json(books[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
