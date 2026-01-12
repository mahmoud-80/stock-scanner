'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          ✅ تم الدفع بنجاح
        </h1>
        <p className="text-gray-600">
          جاري تفعيل اشتراكك...
        </p>
      </div>
    </div>
  );
}
