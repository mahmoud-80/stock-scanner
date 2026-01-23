import { NextResponse } from 'next/server';

/**
 * Get Paylink Access Token
 */
async function getPaylinkAccessToken() {
  const res = await fetch(
    `${process.env.PAYLINK_BASE_URL}/api/getAccessToken`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: process.env.PAYLINK_APP_ID,
        secretKey: process.env.PAYLINK_SECRET_KEY,
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('ACCESS TOKEN ERROR:', errorText);
    throw new Error('FAILED_TO_GET_ACCESS_TOKEN');
  }

  const data = await res.json();

  // Paylink بيرجع id_token
  return data.id_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validation
    if (!body.amount || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // 1️⃣ Get Access Token
    const accessToken = await getPaylinkAccessToken();

    // 2️⃣ Create Invoice
    const response = await fetch(
      `${process.env.PAYLINK_BASE_URL}/api/addInvoice`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: Number(body.amount),
          currency: 'SAR',
          description: body.description || 'Subscription Payment',

          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paylink/callback`,

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

    const data = await response.json();

    console.log('PAYLINK STATUS:', response.status);
    console.log('PAYLINK RESPONSE:', data);

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('PAYLINK ERROR:', error);
    return NextResponse.json(
      { error: 'PAYLINK_CREATE_FAILED' },
      { status: 500 }
    );
  }
}
