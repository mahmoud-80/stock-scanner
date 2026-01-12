import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.amount || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.PAYLINK_BASE_URL}/v1/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ التوثيق الصحيح مع Paylink
          'Authorization': `Bearer ${process.env.PAYLINK_API_KEY}`,
        },
        body: JSON.stringify({
          amount: Number(body.amount),
          currency: 'SAR',
          description: body.description || 'Subscription Payment',
          redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paylink/callback`,
          // ✅ metadata عشان نستخدمها في callback
          metadata: {
            user_id: body.user_id,
            plan_id: body.plan_id,
          },
          customer: {
            name: body.name,
            email: body.email,
          },
        }),
      }
    );

    const data = await response.text();
    console.log('PAYLINK STATUS:', response.status);
    console.log('PAYLINK RESPONSE:', data);

    if (!response.ok) {
      console.error('PAYLINK ERROR:', data);
      return NextResponse.json(
        { error: data },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('CREATE PAYMENT ERROR:', error);
    return NextResponse.json(
      { error: 'PAYLINK_CREATE_FAILED' },
      { status: 500 }
    );
  }
}
