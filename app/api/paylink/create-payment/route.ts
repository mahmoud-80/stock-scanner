import { NextResponse } from 'next/server';

/**
 * 1️⃣ Get Paylink Access Token
 */
async function getPaylinkAccessToken() {
  const res = await fetch(
    'https://restapi.paylink.sa/api/auth',

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

  const data = await res.json();

  if (!res.ok || !data.id_token) {
    console.error('ACCESS TOKEN ERROR:', data);
    throw new Error('FAILED_TO_GET_ACCESS_TOKEN');
  }

  return data.id_token;
}

/**
 * 2️⃣ Create Invoice
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation
    if (!body.amount || !body.name || !body.email) {
      return NextResponse.json(
        { error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Get token
    const accessToken = await getPaylinkAccessToken();

    // Create invoice
    const response = await fetch(
      'https://restapi.paylink.sa/api/addInvoice',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: Number(body.amount),
          currency: 'SAR',
          description: body.description || 'Subscription Payment',

          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
          callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paylink/callback`,

          customer: {
            name: body.name,
            email: body.email,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('CREATE INVOICE ERROR:', data);
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
