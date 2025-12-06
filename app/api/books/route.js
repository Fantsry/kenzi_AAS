import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const [books] = await pool.query('SELECT * FROM books ORDER BY title');
    return NextResponse.json(books, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, author, isbn, stock } = await request.json();

  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, stock, available) VALUES (?, ?, ?, ?, ?)',
      [title, author, isbn, stock, stock],
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Book created' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


