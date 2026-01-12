'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ترجمة النصوص للتسجيل
const loginTranslations = {
  ar: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    haveAccount: 'لديك حساب بالفعل؟ سجل الدخول',
    noAccount: 'ليس لديك حساب؟ سجل الآن',
    processing: 'جاري المعالجة...',
    passwordHint: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    quickLogin: 'تسجيل سريع للتجربة'
  },
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    haveAccount: 'Already have an account? Login',
    noAccount: 'Don\'t have an account? Sign up',
    processing: 'Processing...',
    passwordHint: 'Password must be at least 6 characters',
    quickLogin: 'Quick Login for Testing'
  }
};

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLang, setCurrentLang] = useState('ar');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') || 'ar';
    setCurrentLang(savedLang);
  }, []);

  const t = loginTranslations[currentLang as keyof typeof loginTranslations];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError(currentLang === 'ar' ? 'البريد الإلكتروني وكلمة المرور مطلوبان' : 'Email and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin && !fullName) {
      setError(currentLang === 'ar' ? 'الاسم الكامل مطلوب للتسجيل' : 'Full name is required for registration');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(currentLang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address');
      setLoading(false);
      return;
    }

    try {
      // محاكاة تسجيل دخول ناجح مباشرة (بدون API)
      console.log('🚀 تسجيل دخول مباشر');
      
      const userData = {
        id: 1,
        email: email,
        fullName: fullName || 'مستخدم جديد',
        isSubscribed: false, // بيكون false افتراضي
        subscriptionTier: 'free',
        subscriptionExpiry: null
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // إضافة cookie للمiddleware
      document.cookie = `user=${JSON.stringify(userData)}; path=/`;
      
      console.log('✅ تم حفظ بيانات المستخدم:', userData);
      
      // توجيه لصفحة الاشتراك (لأنه مش مشترك)
      window.location.href = '/subscription';
      
    } catch (error) {
      console.error('❌ خطأ:', error);
      setError(currentLang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (testEmail: string, testPassword: string, testName: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setFullName(testName);
    
    // تسجيل دخول تلقائي بعد تعبئة البيانات
    setTimeout(() => {
      const userData = {
        id: 1,
        email: testEmail,
        fullName: testName,
        isSubscribed: true, // بيكون true للتجربة
        subscriptionTier: 'premium',
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      document.cookie = `user=${JSON.stringify(userData)}; path=/`;
      console.log('✅ تسجيل دخول سريع:', testName);
      window.location.href = '/dashboard';
    }, 500);
  };

  // لا تعرض النموذج حتى يتم تحميل العميل
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
          {isLogin ? t.login : t.register}
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* أزرار تسجيل سريع */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-3 text-center font-medium">{t.quickLogin}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('admin@stock.com', '123456', 'مدير النظام')}
              className="bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
            >
              مدير النظام
            </button>
            <button
              onClick={() => quickLogin('user@stock.com', '123456', 'مستخدم عادي')}
              className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
            >
              مستخدم عادي
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.fullName}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
              minLength={6}
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">{t.passwordHint}</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.processing}
              </span>
            ) : (
              isLogin ? t.login : t.register
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:underline font-medium"
            disabled={loading}
          >
            {isLogin ? t.noAccount : t.haveAccount}
          </button>
        </div>

        {/* روابط مباشرة */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-3">أو انتقل مباشرة إلى:</p>
          <div className="grid grid-cols-2 gap-2">
            <a href="/dashboard" className="bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 text-center block">
              الداشبورد
            </a>
            <a href="/stocks" className="bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 text-center block">
              الأسهم
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}