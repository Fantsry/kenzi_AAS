import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

// This endpoint can be called by a cron job or scheduled task
// For example, using Vercel Cron or a service like cron-job.org
export async function GET(request) {
  // Optional: Add authentication header check for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

