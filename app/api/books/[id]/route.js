import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../../../lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [params.id]);
    if (books.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json(books[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    // Get current book to calculate available
    const [currentBook] = await pool.query('SELECT stock, available FROM books WHERE id = ?', [params.id]);
    if (currentBook.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const currentStock = currentBook[0].stock;
    const currentAvailable = currentBook[0].available;
    const stockDiff = stock - currentStock;
    const newAvailable = Math.max(0, currentAvailable + stockDiff);

    await pool.query(
      'UPDATE books SET title = ?, author = ?, isbn = ?, stock = ?, available = ?, image = ? WHERE id = ?',
      [title, author, isbn, stock, newAvailable, image || null, params.id],
    );

    return NextResponse.json({ message: 'Book updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await pool.query('DELETE FROM books WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Book deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

