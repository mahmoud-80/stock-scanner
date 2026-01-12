import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    /**
     * مثال متوقع من Paylink:
     * body = {
     *   transaction_id,
     *   amount,
     *   status,
     *   metadata: { user_id, plan_id }
     * }
     */

    if (!body.transaction_id || !body.status || !body.metadata) {
      return NextResponse.json(
        { error: 'INVALID_CALLBACK_DATA' },
        { status: 400 }
      );
    }

    await pool.execute(
      `INSERT INTO subscriptions 
       (user_id, plan_id, amount, transaction_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        body.metadata.user_id,
        body.metadata.plan_id,
        body.amount,
        body.transaction_id,
        body.status,
      ]
    );

    if (body.status === 'paid') {
      await pool.execute(
        `UPDATE users SET isSubscribed = 1 WHERE id = ?`,
        [body.metadata.user_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PAYLINK CALLBACK ERROR:', error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
