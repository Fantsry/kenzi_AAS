import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../../../../lib/db';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function PUT(_request, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [borrows] = await pool.query('SELECT * FROM borrows WHERE id = ?', [id]);

    if (borrows.length === 0) {
      return NextResponse.json({ error: 'Borrow record not found' }, { status: 404 });
    }

    const borrow = borrows[0];

    if (session.user.role !== 'admin' && borrow.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const returnDate = new Date();
    await pool.query('UPDATE borrows SET return_date = ?, status = ? WHERE id = ?', [
      returnDate,
      'returned',
      id,
    ]);

    await pool.query('UPDATE books SET available = available + 1 WHERE id = ?', [
      borrow.book_id,
    ]);

    return NextResponse.json({ message: 'Book returned successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


