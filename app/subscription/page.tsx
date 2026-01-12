'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>('ar');

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const savedLang = (localStorage.getItem('language') as 'ar' | 'en') || 'ar';

    setCurrentLang(savedLang);

    if (userData) {
      setUser(JSON.parse(userData));
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('expired') === 'true') {
      alert(
        savedLang === 'ar'
          ? 'انتهى اشتراكك! يرجى التجديد للاستمرار.'
          : 'Your subscription has expired! Please renew to continue.'
      );
    }
  }, []);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'الاشتراك الشهري',
      price: 99,
      period: 'شهر',
      features: [
        'وصول كامل لجميع الفلاتر',
        'بيانات لحظية محدثة',
        'المؤشرات الفنية المتقدمة',
        'دعم فني 24/7',
        'تحديثات مستمرة',
      ],
    },
    {
      id: 'quarterly',
      name: '3 أشهر',
      price: 249,
      period: '3 أشهر',
      popular: true,
      features: [
        'كل مميزات الباقة الشهرية',
        'توفير 15% مقارنة بالشهري',
        'تقارير متقدمة',
        'أولوية في الدعم الفني',
        'نصائح استثمارية حصرية',
      ],
    },
    {
      id: 'yearly',
      name: 'الاشتراك السنوي',
      price: 998,
      period: 'سنة',
      features: [
        'كل مميزات الباقة الربع سنوية',
        'توفير 30% مقارنة بالشهري',
        'تقارير شهرية مفصلة',
        'جلسات استشارية',
        'وصول مبكر للمميزات الجديدة',
      ],
    },
  ];

  const handleSubscribe = async (
    planId: string,
    planPrice: number,
    planName: string
  ) => {
    if (!user) {
      alert(currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/paylink/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: planPrice,
          description: planName,
          name: user.name || 'Customer',
          email: user.email,
        }),
      });

      const data = await res.json();

      if (data?.transaction_url) {
        window.location.href = data.transaction_url;
      } else {
        alert(currentLang === 'ar' ? 'فشل إنشاء عملية الدفع' : 'Payment failed');
      }
    } catch (error) {
      alert(currentLang === 'ar' ? 'حدث خطأ غير متوقع' : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const isArabic = currentLang === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {isArabic ? 'خطط الاشتراك' : 'Subscription Plans'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isArabic
              ? 'اختر الخطة المناسبة لك واستمتع بوصول كامل لجميع مميزات منصتنا'
              : 'Choose the plan that suits you and enjoy full access to all our platform features'}
          </p>
        </div>

        {!user?.isSubscribed && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-blue-800 mb-2">
              🔒 {isArabic ? 'اشترك الآن للوصول الكامل' : 'Subscribe for Full Access'}
            </h3>
            <p className="text-blue-700">
              {isArabic
                ? 'تحتاج للاشتراك للوصول إلى جميع مميزات المنصة'
                : 'You need a subscription to access all platform features'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 font-bold">
                  {isArabic ? 'الأكثر شيوعاً' : 'Most Popular'}
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-2">✔</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() =>
                    handleSubscribe(plan.id, plan.price, plan.name)
                  }
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-bold text-white ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  } disabled:opacity-50`}
                >
                  {loading
                    ? isArabic
                      ? 'جاري التحويل...'
                      : 'Redirecting...'
                    : isArabic
                    ? 'اشترك الآن'
                    : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
