import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// This can be called to manually update overdue status
export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [result] = await pool.query(
      'UPDATE borrows SET status = ? WHERE status = ? AND due_date < ? AND return_date IS NULL',
      ['overdue', 'borrowed', today]
    );

    return NextResponse.json({ 
      success: true, 
      updated: result.affectedRows,
      message: `Updated ${result.affectedRows} borrows to overdue status`
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

