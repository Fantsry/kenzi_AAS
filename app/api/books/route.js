import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../../lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM books';
    let params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }

    query += ' ORDER BY title';
    const [books] = await pool.query(query, params);
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

  const body = await request.json();
  const { title, author, isbn, stock, image } = body;

  if (!title || !author || !isbn || stock === undefined) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, isbn, stock, available, image) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, stock, stock, image || null],
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Book created' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
