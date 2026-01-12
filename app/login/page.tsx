'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ترجمة النصوص
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
    invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
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
    invalid: 'Invalid email or password'
  }
};

// 🔐 بيانات الأدمن
const ADMIN = {
  email: 'admin@stock.com',
  password: '123456',
  fullName: 'Admin'
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
    setCurrentLang(localStorage.getItem('language') || 'ar');
  }, []);

  const t = loginTranslations[currentLang as keyof typeof loginTranslations];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 🟢 تسجيل دخول Admin
    if (
      isLogin &&
      email === ADMIN.email &&
      password === ADMIN.password
    ) {
      const adminData = {
        id: 1,
        email: ADMIN.email,
        fullName: ADMIN.fullName,
        role: 'admin',
        isSubscribed: true
      };

      localStorage.setItem('user', JSON.stringify(adminData));
      document.cookie = `user=${JSON.stringify(adminData)}; path=/`;

      router.push('/dashboard');
      return;
    }

    // 🟢 Register أو Login عادي (مؤقت – بدون DB)
    const userData = {
      id: Date.now(),
      email,
      fullName: fullName || email.split('@')[0],
      role: 'user',
      isSubscribed: false
    };

    localStorage.setItem('user', JSON.stringify(userData));
    document.cookie = `user=${JSON.stringify(userData)}; path=/`;

    router.push('/subscription');
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isLogin ? t.login : t.register}
        </h2>

        {error && (
          <div className="bg-red-50 p-3 mb-4 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input
              placeholder={t.fullName}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          )}

          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
            minLength={6}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? t.processing : isLogin ? t.login : t.register}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600"
          >
            {isLogin ? t.noAccount : t.haveAccount}
          </button>
        </div>
      </div>
    </div>
  );
}
