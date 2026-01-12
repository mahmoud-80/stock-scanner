// app/dashboard/subscription/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionInfo {
  type: string;
  startDate: string;
  expiryDate: string;
  status: string;
  daysRemaining: number;
}

export default function SubscriptionManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState('ar');
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setCurrentLang(savedLang);
    
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      if (userObj.isSubscribed) {
        const daysRemaining = calculateDaysRemaining(userObj.subscriptionExpiry);
        setSubscription({
          type: userObj.subscriptionType,
          startDate: userObj.subscriptionStart,
          expiryDate: userObj.subscriptionExpiry,
          status: userObj.subscriptionStatus,
          daysRemaining: daysRemaining
        });

        // تحديث أيام المتبقية في localStorage
        const updatedUser = {
          ...userObj,
          daysRemaining: daysRemaining
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  }, []);

  const calculateDaysRemaining = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleRenewSubscription = () => {
    router.push('/subscription');
  };

  const getSubscriptionProgress = () => {
    if (!subscription) return 0;
    
    const start = new Date(subscription.startDate);
    const expiry = new Date(subscription.expiryDate);
    const totalDays = Math.ceil((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const usedDays = totalDays - subscription.daysRemaining;
    
    return (usedDays / totalDays) * 100;
  };

  const isArabic = currentLang === 'ar';

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {isArabic ? 'إدارة الاشتراك' : 'Subscription Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isArabic 
              ? 'تابع حالة اشتراكك والوقت المتبقي' 
              : 'Track your subscription status and remaining time'
            }
          </p>
        </div>

        {!user.isSubscribed ? (
          // لم يشترك بعد
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isArabic ? 'لا يوجد اشتراك نشط' : 'No Active Subscription'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isArabic 
                ? 'أنت لا تملك اشتراكاً نشطاً. اشترك الآن للوصول الكامل للمنصة.'
                : 'You don\'t have an active subscription. Subscribe now for full platform access.'
              }
            </p>
            <button
              onClick={() => router.push('/subscription')}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 font-bold"
            >
              {isArabic ? 'الاشتراك الآن' : 'Subscribe Now'}
            </button>
          </div>
        ) : subscription ? (
          // يوجد اشتراك نشط
          <div className="space-y-6">
            {/* بطاقة حالة الاشتراك */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {isArabic ? 'حالة الاشتراك' : 'Subscription Status'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status === 'active' 
                    ? (isArabic ? 'نشط' : 'Active')
                    : (isArabic ? 'منتهي' : 'Expired')
                  }
                </span>
              </div>
              
              {/* شريط التقدم */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{isArabic ? 'مدة الاشتراك' : 'Subscription Period'}</span>
                  <span>{subscription.daysRemaining} {isArabic ? 'يوم متبقي' : 'days left'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      subscription.daysRemaining > 7 
                        ? 'bg-green-500' 
                        : subscription.daysRemaining > 3 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${getSubscriptionProgress()}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{isArabic ? 'نوع الاشتراك:' : 'Plan Type:'}</span>
                    <span className="font-bold text-blue-600 capitalize">
                      {subscription.type === 'monthly' ? (isArabic ? 'شهري' : 'Monthly') :
                       subscription.type === 'quarterly' ? (isArabic ? '3 أشهر' : '3 Months') :
                       isArabic ? 'سنوي' : 'Yearly'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{isArabic ? 'تاريخ البدء:' : 'Start Date:'}</span>
                    <span className="font-bold">
                      {new Date(subscription.startDate).toLocaleDateString(
                        isArabic ? 'ar-SA' : 'en-US'
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{isArabic ? 'تاريخ الانتهاء:' : 'Expiry Date:'}</span>
                    <span className="font-bold">
                      {new Date(subscription.expiryDate).toLocaleDateString(
                        isArabic ? 'ar-SA' : 'en-US'
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{isArabic ? 'الحالة:' : 'Status:'}</span>
                    <span className={`font-bold ${
                      subscription.daysRemaining > 7 
                        ? 'text-green-600' 
                        : subscription.daysRemaining > 3 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {subscription.daysRemaining > 0 
                        ? `${subscription.daysRemaining} ${isArabic ? 'يوم متبقي' : 'days left'}` 
                        : (isArabic ? 'منتهي' : 'Expired')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* إشعارات */}
            {subscription.daysRemaining <= 7 && subscription.daysRemaining > 0 && (
              <div className={`p-6 rounded-2xl ${
                subscription.daysRemaining > 3 
                  ? 'bg-yellow-50 border border-yellow-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {subscription.daysRemaining > 3 ? '⚠️' : '🔔'}
                  </span>
                  <div>
                    <h4 className={`font-bold ${
                      subscription.daysRemaining > 3 ? 'text-yellow-800' : 'text-red-800'
                    }`}>
                      {subscription.daysRemaining > 3
                        ? (isArabic ? 'اشتراكك على وشك الانتهاء' : 'Your subscription is ending soon')
                        : (isArabic ? 'اشتراكك ينتهي قريباً' : 'Your subscription is about to expire')
                      }
                    </h4>
                    <p className={
                      subscription.daysRemaining > 3 ? 'text-yellow-700' : 'text-red-700'
                    }>
                      {isArabic 
                        ? `متبقي ${subscription.daysRemaining} أيام على انتهاء اشتراكك. جدد الآن لضمان استمرارية الخدمة.`
                        : `You have ${subscription.daysRemaining} days left. Renew now to ensure continuous service.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscription.status === 'expired' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <h4 className="font-bold text-red-800">
                      {isArabic ? 'انتهى اشتراكك' : 'Subscription Expired'}
                    </h4>
                    <p className="text-red-700">
                      {isArabic 
                        ? 'انتهت فترة اشتراكك. جدد الآن لاستعادة الوصول الكامل.'
                        : 'Your subscription period has ended. Renew now to restore full access.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRenewSubscription}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-bold transition-colors"
                >
                  {isArabic ? 'تجديد الاشتراك' : 'Renew Subscription'}
                </button>
                
                <button
                  onClick={() => router.push('/subscription')}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-bold transition-colors"
                >
                  {isArabic ? 'ترقية الخطة' : 'Upgrade Plan'}
                </button>
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-4">
                {isArabic 
                  ? 'سيتم إنهاء الاشتراك تلقائياً بعد انتهاء المدة' 
                  : 'Subscription will automatically end after expiry'
                }
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}