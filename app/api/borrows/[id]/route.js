import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '../../../../lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { status: newStatus } = body;

  try {
    // Get borrow record
    const [borrows] = await pool.query('SELECT * FROM borrows WHERE id = ?', [id]);
    if (borrows.length === 0) {
      return NextResponse.json({ error: 'Borrow record not found' }, { status: 404 });
    }

    const borrow = borrows[0];

    // Check if user owns this borrow or is admin
    if (session.user.role !== 'admin' && borrow.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If updating to returned, update return_date and available
    if (newStatus === 'returned' && borrow.status !== 'returned') {
      const returnDate = new Date();
      await pool.query(
        'UPDATE borrows SET status = ?, return_date = ? WHERE id = ?',
        [newStatus, returnDate, id],
      );
      await pool.query('UPDATE books SET available = available + 1 WHERE id = ?', [borrow.book_id]);
    } else {
      await pool.query('UPDATE borrows SET status = ? WHERE id = ?', [newStatus, id]);
    }

    return NextResponse.json({ message: 'Borrow updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

