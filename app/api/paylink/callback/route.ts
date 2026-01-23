import { NextResponse } from 'next/server';
import pool from '@/app/lib/database';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('PAYLINK CALLBACK BODY:', body);

    // ✅ مرونة في أسماء الحقول
    const transactionId =
      body.transaction_id || body.transactionNo || body.transaction_id;

    const status =
      body.status || body.orderStatus;

    const amount = body.amount;
    const metadata = body.metadata;

    if (!transactionId || !status || !metadata?.user_id) {
      return NextResponse.json(
        { error: 'INVALID_CALLBACK_DATA' },
        { status: 400 }
      );
    }

    // 1️⃣ تأكد إن المعاملة مش متسجلة قبل كده
    const [existing]: any = await pool.execute(
      `SELECT id FROM subscriptions WHERE transaction_id = ?`,
      [transactionId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, duplicated: true });
    }

    // 2️⃣ حفظ الاشتراك
    await pool.execute(
      `INSERT INTO subscriptions 
       (user_id, plan_id, amount, transaction_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        metadata.user_id,
        metadata.plan_id || null,
        amount,
        transactionId,
        status,
      ]
    );

    // 3️⃣ تفعيل الاشتراك لو Paid
    if (status.toLowerCase() === 'paid') {
      await pool.execute(
        `UPDATE users SET isSubscribed = 1 WHERE id = ?`,
        [metadata.user_id]
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
