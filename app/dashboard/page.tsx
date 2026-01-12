'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  isSubscribed: boolean;
  loginTime: string;
}

interface DashboardStats {
  favoriteStocks: number;
  savedFilters: number;
  activeAlerts: number;
  portfolioValue: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentStocks, setRecentStocks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات حقيقية من API
      const stocksResponse = await fetch('/api/stocks?filter=all&limit=5');
      const stocksData = await stocksResponse.json();
      
      // بيانات إحصائية حقيقية
      const dashboardStats: DashboardStats = {
        favoriteStocks: JSON.parse(localStorage.getItem('favorites') || '[]').length,
        savedFilters: JSON.parse(localStorage.getItem('savedFilters') || '[]').length,
        activeAlerts: JSON.parse(localStorage.getItem('alerts') || '[]').length,
        portfolioValue: calculatePortfolioValue(stocksData.data || [])
      };

      setStats(dashboardStats);
      setRecentStocks(stocksData.data?.slice(0, 5) || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // بيانات طوارئ إذا فشل الاتصال
      setStats({
        favoriteStocks: 0,
        savedFilters: 0,
        activeAlerts: 0,
        portfolioValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioValue = (stocks: any[]): number => {
    if (!stocks.length) return 0;
    
    // محاكاة قيمة محفظة (يمكن استبدالها ببيانات حقيقية لاحقاً)
    const totalValue = stocks.reduce((sum, stock) => {
      const shares = Math.floor(Math.random() * 100) + 1;
      return sum + (stock.price * shares);
    }, 0);
    
    return Math.round(totalValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('savedFilters');
    setUser(null);
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">لوحة التحكم - Trend spx</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">مرحباً، {user.email}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* الأزرار الرئيسية - الأسهم وتجديد الاشتراك فقط */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* زر الأسهم */}
        <a 
          href="/stocks" 
          className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700 hover:bg-gray-750 transition-colors text-center block"
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">الأسهم</h3>
          <p className="text-gray-400">عرض وتحليل الأسهم المباشرة</p>
        </a>

        {/* زر تجديد الاشتراك */}
        <a 
          href="/subscription" 
          className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700 hover:bg-gray-750 transition-colors text-center block"
        >
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-bold text-white mb-2">تجديد الاشتراك</h3>
          <p className="text-gray-400">إدارة اشتراكك وترقيته</p>
        </a>
      </div>

      {/* الأسهم الأخيرة فقط */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-white">آخر الأسهم المتابعة</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : recentStocks.length > 0 ? (
          <div className="space-y-3">
            {recentStocks.map((stock, index) => (
              <div key={index} className="flex justify-between items-center p-3 border-b border-gray-700">
                <div>
                  <span className="font-bold text-white">{stock.symbol}</span>
                  <span className="text-gray-400 text-sm mr-2">{stock.name}</span>
                </div>
                <span className={`font-bold ${
                  stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stock.changePercent >= 0 ? '↑' : '↓'} {stock.changePercent?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">لا توجد أسهم متابعة حالياً</p>
        )}
      </div>

      {/* حالة الاشتراك */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">حالة الاشتراك</h2>
        <div className={`inline-flex items-center px-4 py-2 rounded-lg text-lg font-medium ${
          user?.isSubscribed 
            ? 'bg-green-600 text-white' 
            : 'bg-yellow-600 text-white'
        }`}>
          {user?.isSubscribed ? '🟢 الاشتراك مفعل' : '🟡 النسخة التجريبية'}
        </div>
        {!user?.isSubscribed && (
          <div className="mt-4">
            <a 
              href="/subscription" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors inline-block"
            >
              ترقية للاشتراك الكامل
            </a>
          </div>
        )}
      </div>
    </div>
  );
}