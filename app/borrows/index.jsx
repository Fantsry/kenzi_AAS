import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../lib/db';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, 
             bk.title as book_title, bk.author as book_author
      FROM borrows b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
    `;

    if (session.user.role !== 'admin') {
      query += ' WHERE b.user_id = ?';
      const [borrows] = await pool.query(query, [session.user.id]);
      return NextResponse.json(borrows, { status: 200 });
    } else {
      const [borrows] = await pool.query(query + ' ORDER BY b.created_at DESC');
      return NextResponse.json(borrows, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { book_id } = await request.json();

  try {
    const [books] = await pool.query('SELECT * FROM books WHERE id = ?', [book_id]);

    if (books.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (books[0].available <= 0) {
      return NextResponse.json({ error: 'Book not available' }, { status: 400 });
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const [result] = await pool.query(
      'INSERT INTO borrows (user_id, book_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [session.user.id, book_id, borrowDate, dueDate, 'borrowed'],
    );

    await pool.query('UPDATE books SET available = available - 1 WHERE id = ?', [book_id]);

    return NextResponse.json(
      { id: result.insertId, message: 'Book borrowed successfully' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}