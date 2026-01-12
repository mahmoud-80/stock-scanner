'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import './globals.css';

// ترجمة النصوص
const translations = {
  ar: {
    header: {
      home: 'الرئيسية',
      stocks: 'الأسهم',
      dashboard: 'لوحة التحكم',
      subscription: 'الاشتراك',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      title: '📈 Trend spx | منصة الأسهم المتقدمة'
    },
    footer: {
      copyright: '© 2024 Trend spx. جميع الحقوق محفوظة.'
    }
  },
  en: {
    header: {
      home: 'Home',
      stocks: 'Stocks',
      dashboard: 'Dashboard',
      subscription: 'Subscription',
      login: 'Login',
      logout: 'Logout',
      title: '📈 Trend spx | Advanced Stock Platform'
    },
    footer: {
      copyright: '© 2024 Trend spx. All rights reserved.'
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState('ar');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      document.cookie = `user=${userData}; path=/`;
    }

    const savedLang = localStorage.getItem('language') || 'ar';
    setCurrentLang(savedLang);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    router.push('/');
  };

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const t = translations[currentLang as keyof typeof translations];

  if (!mounted) {
    return (
      <html lang="ar" dir="rtl">
        <body className="bg-gray-900">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="loading-spinner rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-400">جاري التحميل...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html 
      lang={currentLang} 
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'} 
      suppressHydrationWarning
    >
      <head>
        <title>TRENDSPX - Stock Screener</title>
        <meta name="description" content="Advanced stock screening platform with real-time data" />
        <link rel="icon" href="/logo.jpeg" />

        <style jsx global>{`
          /* --- الكود الجديد للوجو --- */

          .header-logo-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto !important;
            height: auto !important;
            padding: 4px 0;
          }

          .header-logo-wrapper img {
            height: 85px;     /* ← تقدر تغيّر الرقم ده */
            width: auto !important;
            object-fit: contain;
            display: block;
          }

          /* لوجو الفوتر */
          .footer-logo-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto !important;
            height: auto !important;
            padding: 10px 0;
          }

          .footer-logo-wrapper img {
            height: 70px;
            width: auto;
            object-fit: contain;
          }

          /* تحسين الهيدر */
          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          /* موبايل */
          @media (max-width: 768px) {
            .header-logo-wrapper img {
              height: 65px;
            }
            .footer-logo-wrapper img {
              height: 55px;
            }

            .header-content {
              flex-direction: column;
              gap: 10px;
            }
          }
        `}</style>
      </head>

      <body className="bg-gray-900 text-white" suppressHydrationWarning>
        
        {/* الهيدر */}
        <header className="bg-gray-800/95 shadow-sm border-b border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="header-content">

              {/* اللوجو */}
              <Link href="/" className="flex items-center">
                <div className="header-logo-wrapper">
                  <img 
                    src="/images/logo.jpeg" 
                    alt="TRENDSPX Logo"
                    onError={(e) => (e.currentTarget.src = "/images/logo.jpg")}
                  />
                </div>
              </Link>

              {/* القائمة */}
              <nav className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">

                {/* اللغات */}
                <div className="lang-switcher flex items-center gap-2">
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentLang === 'ar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    العربية
                  </button>

                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      currentLang === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* الروابط */}
                <div className="flex items-center gap-4 md:gap-6">
                  <Link href="/" className="hover:text-blue-400 font-medium transition px-3">
                    {t.header.home}
                  </Link>

                  {user ? (
                    <>
                      <Link href="/stocks" className="hover:text-blue-400 font-medium transition px-3">
                        {t.header.stocks}
                      </Link>

                      <Link href="/dashboard" className="hover:text-blue-400 font-medium transition px-3">
                        {t.header.dashboard}
                      </Link>

                      <Link href="/subscription" className="hover:text-blue-400 font-medium transition px-3">
                        {t.header.subscription}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition"
                      >
                        {t.header.logout}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-base"
                    >
                      {t.header.login}
                    </Link>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </header>

        
        {/* المحتوى */}
        <main className="min-h-screen">{children}</main>

        {/* الفوتر */}
        <footer className="bg-gray-800 text-white py-10 mt-12">
          <div className="container mx-auto px-4 text-center">

            <div className="footer-logo-wrapper">
              <img
                src="/images/logo.jpeg"
                alt="TRENDSPX Logo"
                onError={(e) => (e.currentTarget.src = '/images/logo.jpg')}
              />
            </div>

            <p className="text-gray-400 mt-4">
              {t.footer.copyright}
            </p>

            <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
              {currentLang === 'ar'
                ? 'منصة متقدمة لفلترة الأسهم والتحليل الفني باستخدام أحدث التقنيات'
                : 'Advanced stock screening and technical analysis platform using latest technologies'}
            </p>

          </div>
        </footer>

      </body>
    </html>
  );
}
