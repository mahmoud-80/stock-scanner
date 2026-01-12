// app/stocks/page.tsx
'use client';
import { useState, useEffect } from 'react';

interface TechnicalIndicator {
  rsi?: number;
  macd?: number;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  ema_20?: number;
  ema_50?: number;
  ema_100?: number;
  volume_avg?: number;
  relative_volume?: number;
  weekly_change?: number;
  vwap?: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated?: string;
  technicals?: TechnicalIndicator;
  previousClose?: number;
  freeFloat?: number;
  marketCap?: number;
  weeklyChange?: number;
  aboveEMA20?: boolean;
  aboveEMA50?: boolean;
  aboveEMA100?: boolean;
  relativeVolume?: number;
  openPrice?: number;
  changeFromOpen?: number;
  changeFromOpenPercent?: number;
  aboveVWAP?: boolean;
  emaCrossover20_50?: boolean;
  emaCrossover50_100?: boolean;
  rsi?: number;
}

interface CustomFilter {
  id: string;
  name: string;
  conditions: Condition[];
}

interface Condition {
  field: string;
  operator: string;
  value: number;
  value2?: number;
  timeframe?: string;
}

interface FilterFormData {
  priceFrom: string;
  priceTo: string;
  changePercent: string;
  changeTimeframe: string;
  freeFloatFrom: string;
  freeFloatTo: string;
  volumeFrom: string;
  volumeTo: string;
  relativeVolume: string;
  ema20Condition: boolean;
  ema50Condition: boolean;
  ema100Condition: boolean;
  emaTimeframe: string;
  emaCrossover20_50: boolean;
  emaCrossover50_100: boolean;
  vwapCondition: string;
  rsiFrom: string;
  rsiTo: string;
  changeFromOpen: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('premarket');
  const [currentTime, setCurrentTime] = useState('');
  const [showTechnicals, setShowTechnicals] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [searchDelay, setSearchDelay] = useState(false);
  
  const [filterForm, setFilterForm] = useState<FilterFormData>({
    priceFrom: '',
    priceTo: '',
    changePercent: '',
    changeTimeframe: 'daily',
    freeFloatFrom: '',
    freeFloatTo: '',
    volumeFrom: '',
    volumeTo: '',
    relativeVolume: '',
    ema20Condition: false,
    ema50Condition: false,
    ema100Condition: false,
    emaTimeframe: 'daily',
    emaCrossover20_50: false,
    emaCrossover50_100: false,
    vwapCondition: '',
    rsiFrom: '',
    rsiTo: '',
    changeFromOpen: ''
  });

  // قوائم الخيارات المحددة
  const changePercentOptions = [
    { value: '5', label: '5%+' },
    { value: '10', label: '10%+' },
    { value: '15', label: '15%+' },
    { value: '20', label: '20%+' },
    { value: '25', label: '25%+' },
    { value: '30', label: '30%+' },
    { value: '40', label: '40%+' },
    { value: '50', label: '50%+' },
    { value: '75', label: '75%+' },
    { value: '100', label: '100%+' }
  ];

  const timeframeOptions = [
    { value: 'hourly', label: 'ساعة' },
    { value: '4hours', label: '4 ساعات' },
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' }
  ];

  const relativeVolumeOptions = [
    { value: '1', label: '1x' },
    { value: '1.5', label: '1.5x' },
    { value: '2', label: '2x' },
    { value: '2.5', label: '2.5x' },
    { value: '3', label: '3x' },
    { value: '4', label: '4x' },
    { value: '5', label: '5x' }
  ];

  // تحميل الفلاتر المخصصة من localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('customStockFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setCustomFilters(filters);
      } catch (error) {
        console.error('Error loading custom filters:', error);
      }
    }
  }, []);

  // تحديث الوقت
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('ar-EG'));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // جلب البيانات مع تأخير البحث
  const fetchStocks = async (filter: string = 'premarket') => {
    try {
      setLoading(true);
      setError(null);
      setSearchDelay(true);
      
      console.log('🔄 جلب البيانات مع الفلتر:', filter);
      
      // تأخير 3-5 ثواني لمحاكاة البحث الواقعي
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
      
      let url = `/api/stocks?filter=${filter}&technical=${showTechnicals}`;
      
      // معالجة الفلاتر المخصصة
      if (filter.startsWith('custom-')) {
        const savedFilters = localStorage.getItem('customStockFilters');
        if (savedFilters) {
          const customFilters = JSON.parse(savedFilters);
          const currentFilter = customFilters.find((f: any) => f.id === filter);
          if (currentFilter) {
            url += `&customFilter=${encodeURIComponent(JSON.stringify(currentFilter.conditions))}`;
          }
        }
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch stocks');
      }
      
      console.log('✅ تم جلب البيانات بنجاح:', result.data.length, 'سهم');
      setStocks(result.data || []);
      setSearchDelay(false);
      
    } catch (err) {
      console.error('❌ خطأ في جلب الأسهم:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStocks([]);
      setSearchDelay(false);
    } finally {
      setLoading(false);
    }
  };

  // التحديث كل 25 ثانية
  useEffect(() => {
    fetchStocks(activeFilter);

    const interval = setInterval(() => {
      fetchStocks(activeFilter);
    }, 25000);

    return () => clearInterval(interval);
  }, [activeFilter, showTechnicals]);

  // تحديث حقل في الفورم
  const updateFilterField = (field: keyof FilterFormData, value: string | boolean) => {
    setFilterForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // تطبيق الأداة المخصصة
  const applyCustomFilter = () => {
    const conditions: Condition[] = [];
    
    // السعر
    if (filterForm.priceFrom || filterForm.priceTo) {
      conditions.push({
        field: 'price',
        operator: 'between',
        value: Number(filterForm.priceFrom) || 0,
        value2: Number(filterForm.priceTo) || 999999
      });
    }
    
    // التغير % - مع المدة الزمنية
    if (filterForm.changePercent) {
      conditions.push({
        field: 'changePercent',
        operator: 'greater',
        value: Number(filterForm.changePercent),
        timeframe: filterForm.changeTimeframe
      });
    }
    
    // FREE FLOAT
    if (filterForm.freeFloatFrom || filterForm.freeFloatTo) {
      conditions.push({
        field: 'freeFloat',
        operator: 'between',
        value: Number(filterForm.freeFloatFrom) || 0,
        value2: Number(filterForm.freeFloatTo) || 999999999
      });
    }
    
    // الڤوليوم
    if (filterForm.volumeFrom || filterForm.volumeTo) {
      conditions.push({
        field: 'volume',
        operator: 'between',
        value: Number(filterForm.volumeFrom) || 0,
        value2: Number(filterForm.volumeTo) || 999999999
      });
    }

    // Relative Volume
    if (filterForm.relativeVolume) {
      conditions.push({
        field: 'relativeVolume',
        operator: 'greater',
        value: Number(filterForm.relativeVolume)
      });
    }

    // EMA 20
    if (filterForm.ema20Condition) {
      conditions.push({
        field: 'ema20',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    // EMA 50
    if (filterForm.ema50Condition) {
      conditions.push({
        field: 'ema50',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    // EMA 100
    if (filterForm.ema100Condition) {
      conditions.push({
        field: 'ema100',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    // EMA Crossovers
    if (filterForm.emaCrossover20_50) {
      conditions.push({
        field: 'emaCrossover20_50',
        operator: 'above',
        value: 1
      });
    }

    if (filterForm.emaCrossover50_100) {
      conditions.push({
        field: 'emaCrossover50_100',
        operator: 'above',
        value: 1
      });
    }

    // VWAP
    if (filterForm.vwapCondition) {
      conditions.push({
        field: 'vwap',
        operator: filterForm.vwapCondition as 'above' | 'below',
        value: 1
      });
    }

    // RSI
    if (filterForm.rsiFrom || filterForm.rsiTo) {
      conditions.push({
        field: 'rsi',
        operator: 'between',
        value: Number(filterForm.rsiFrom) || 0,
        value2: Number(filterForm.rsiTo) || 100
      });
    }

    // تغير من الافتتاح
    if (filterForm.changeFromOpen) {
      conditions.push({
        field: 'changeFromOpenPercent',
        operator: 'greater',
        value: Number(filterForm.changeFromOpen)
      });
    }

    if (conditions.length === 0) {
      alert('يرجى إدخال شرط واحد على الأقل');
      return;
    }

    const filterId = `custom-${Date.now()}`;
    const filterName = prompt('أدخل اسم الأداة:') || `أداة مخصصة ${new Date().toLocaleTimeString()}`;
    
    const filterToSave: CustomFilter = {
      id: filterId,
      name: filterName,
      conditions
    };

    const updatedFilters = [...customFilters, filterToSave];
    setCustomFilters(updatedFilters);
    localStorage.setItem('customStockFilters', JSON.stringify(updatedFilters));
    
    setActiveFilter(filterId);
    setShowFilterModal(false);
    clearFilterForm();
    fetchStocks(filterId);
  };

  // مسح الفورم
  const clearFilterForm = () => {
    setFilterForm({
      priceFrom: '',
      priceTo: '',
      changePercent: '',
      changeTimeframe: 'daily',
      freeFloatFrom: '',
      freeFloatTo: '',
      volumeFrom: '',
      volumeTo: '',
      relativeVolume: '',
      ema20Condition: false,
      ema50Condition: false,
      ema100Condition: false,
      emaTimeframe: 'daily',
      emaCrossover20_50: false,
      emaCrossover50_100: false,
      vwapCondition: '',
      rsiFrom: '',
      rsiTo: '',
      changeFromOpen: ''
    });
  };

  // حفظ الأداة
  const saveCustomFilter = () => {
    const conditions: Condition[] = [];
    
    // نفس منطق applyCustomFilter ولكن بدون التطبيق الفوري
    if (filterForm.priceFrom || filterForm.priceTo) {
      conditions.push({
        field: 'price',
        operator: 'between',
        value: Number(filterForm.priceFrom) || 0,
        value2: Number(filterForm.priceTo) || 999999
      });
    }

    if (filterForm.changePercent) {
      conditions.push({
        field: 'changePercent',
        operator: 'greater',
        value: Number(filterForm.changePercent),
        timeframe: filterForm.changeTimeframe
      });
    }

    if (filterForm.freeFloatFrom || filterForm.freeFloatTo) {
      conditions.push({
        field: 'freeFloat',
        operator: 'between',
        value: Number(filterForm.freeFloatFrom) || 0,
        value2: Number(filterForm.freeFloatTo) || 999999999
      });
    }

    if (filterForm.volumeFrom || filterForm.volumeTo) {
      conditions.push({
        field: 'volume',
        operator: 'between',
        value: Number(filterForm.volumeFrom) || 0,
        value2: Number(filterForm.volumeTo) || 999999999
      });
    }

    if (filterForm.relativeVolume) {
      conditions.push({
        field: 'relativeVolume',
        operator: 'greater',
        value: Number(filterForm.relativeVolume)
      });
    }

    if (filterForm.ema20Condition) {
      conditions.push({
        field: 'ema20',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    if (filterForm.ema50Condition) {
      conditions.push({
        field: 'ema50',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    if (filterForm.ema100Condition) {
      conditions.push({
        field: 'ema100',
        operator: 'above',
        value: 1,
        timeframe: filterForm.emaTimeframe
      });
    }

    if (filterForm.emaCrossover20_50) {
      conditions.push({
        field: 'emaCrossover20_50',
        operator: 'above',
        value: 1
      });
    }

    if (filterForm.emaCrossover50_100) {
      conditions.push({
        field: 'emaCrossover50_100',
        operator: 'above',
        value: 1
      });
    }

    if (filterForm.vwapCondition) {
      conditions.push({
        field: 'vwap',
        operator: filterForm.vwapCondition as 'above' | 'below',
        value: 1
      });
    }

    if (filterForm.rsiFrom || filterForm.rsiTo) {
      conditions.push({
        field: 'rsi',
        operator: 'between',
        value: Number(filterForm.rsiFrom) || 0,
        value2: Number(filterForm.rsiTo) || 100
      });
    }

    if (filterForm.changeFromOpen) {
      conditions.push({
        field: 'changeFromOpenPercent',
        operator: 'greater',
        value: Number(filterForm.changeFromOpen)
      });
    }

    if (conditions.length === 0) {
      alert('يرجى إدخال شرط واحد على الأقل');
      return;
    }

    const filterName = prompt('أدخل اسم الأداة:');
    if (!filterName) return;

    const filterId = `custom-${Date.now()}`;
    const filterToSave: CustomFilter = {
      id: filterId,
      name: filterName,
      conditions
    };

    const updatedFilters = [...customFilters, filterToSave];
    setCustomFilters(updatedFilters);
    localStorage.setItem('customStockFilters', JSON.stringify(updatedFilters));
    
    setShowFilterModal(false);
    clearFilterForm();
    alert('تم حفظ الأداة بنجاح!');
  };

  // حذف أداة مخصصة
  const deleteCustomFilter = (filterId: string) => {
    const updatedFilters = customFilters.filter(f => f.id !== filterId);
    setCustomFilters(updatedFilters);
    localStorage.setItem('customStockFilters', JSON.stringify(updatedFilters));
    
    if (activeFilter === filterId) {
      setActiveFilter('premarket');
    }
  };

  // الأدوات الجاهزة
  const filters = [
    { id: 'premarket', name: 'انفجارات البري ماركت' },
    { id: 'opening', name: 'فلتر لافتتاح' },
    { id: 'swing', name: 'الأسهم السوينق' },

  ];

  // إحصائيات سريعة - جميعها بنفس اللون
  const stats = !loading && !error && stocks.length > 0 && (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
        <div className="text-blue-400 font-bold text-lg">{stocks.length}</div>
        <div className="text-gray-300 text-sm">عدد الأسهم</div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
        <div className="text-blue-400 font-bold text-lg">
          {stocks.filter(s => s.changePercent > 0).length}
        </div>
        <div className="text-gray-300 text-sm">صاعد</div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
        <div className="text-blue-400 font-bold text-lg">
          {stocks.filter(s => s.changePercent < 0).length}
        </div>
        <div className="text-gray-300 text-sm">هابط</div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
        <div className="text-blue-400 font-bold text-lg">
          {activeFilter !== 'all' ? 'مفلتر' : 'كل الأسهم'}
        </div>
        <div className="text-gray-300 text-sm">الحالة</div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-white">📊 جدول الأسهم المباشر - Trend spx</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowTechnicals(!showTechnicals)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                showTechnicals 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>📈</span>
              {showTechnicals ? 'إخفاء المؤشرات' : 'المؤشرات الفنية'}
            </button>

            <button
              onClick={() => setShowFilterModal(true)}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <span>➕</span>
              إضافة أداة مخصصة
            </button>
          </div>
        </div>
        
        {/* الأدوات الجاهزة والمخصصة */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-300 mb-2">الأدوات المتاحة</h3>
          <div className="flex gap-2 mb-6 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter.name}
              </button>
            ))}
            
            {customFilters.map((filter) => (
              <div key={filter.id} className="relative">
                <button
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filter.name}
                </button>
                <button
                  onClick={() => deleteCustomFilter(filter.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* مؤشر التحديث */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>🔄 التحديث التلقائي كل 25 ثانية - آخر تحديث: {currentTime || 'جاري التحميل...'}</span>
          </div>
        </div>

        {/* مؤشر البحث */}
        {searchDelay && (
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 text-blue-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              <span>🔍 جاري البحث عن الأسهم المناسبة...</span>
            </div>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-300">
              <span>⚠️</span>
              <span>خطأ في جلب البيانات: {error}</span>
            </div>
          </div>
        )}
      </div>

      {/* الإحصائيات */}
      {stats}

      {/* جدول الأسهم */}
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">الرمز</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">اسم السهم</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">السعر</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">التغير</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">FREE FLOAT</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">إغلاق الأمس</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">EMA 20</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">EMA 50</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">EMA 100</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">Relative Volume</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">VWAP</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">RSI</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">تغير الافتتاح</th>
                    {showTechnicals && (
                      <>
                        <th className="px-6 py-3 text-right font-semibold text-gray-300">MACD</th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-300">SMA 20</th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-300">SMA 50</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-right font-semibold text-gray-300">الحجم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {stocks.map((stock, index) => (
                    <tr key={stock.symbol} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-6 py-4 font-bold text-white">{stock.symbol}</td>
                      <td className="px-6 py-4 text-gray-300">{stock.name}</td>
                      <td className="px-6 py-4 font-bold text-white">${stock.price.toFixed(2)}</td>
                      <td className={`px-6 py-4 font-bold ${
                        stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stock.change >= 0 ? '↑' : '↓'} {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {stock.freeFloat ? (stock.freeFloat / 1000000).toFixed(1) + 'M' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        ${stock.previousClose?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          stock.aboveEMA20 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {stock.aboveEMA20 ? 'فوق' : 'تحت'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          stock.aboveEMA50 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {stock.aboveEMA50 ? 'فوق' : 'تحت'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          stock.aboveEMA100 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {stock.aboveEMA100 ? 'فوق' : 'تحت'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          (stock.relativeVolume || 0) >= 2 ? 'bg-green-900 text-green-300' :
                          (stock.relativeVolume || 0) >= 1 ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {stock.relativeVolume ? stock.relativeVolume.toFixed(1) + 'x' : 'N/A'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          stock.aboveVWAP 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {stock.aboveVWAP ? 'فوق' : 'تحت'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          !stock.rsi ? 'bg-gray-700 text-gray-400' :
                          stock.rsi > 70 ? 'bg-red-900 text-red-300' :
                          stock.rsi < 30 ? 'bg-green-900 text-green-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {stock.rsi ? stock.rsi.toFixed(1) : 'N/A'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          !stock.changeFromOpenPercent ? 'bg-gray-700 text-gray-400' :
                          stock.changeFromOpenPercent >= 0 ? 'bg-green-900 text-green-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {stock.changeFromOpenPercent ? `${stock.changeFromOpenPercent.toFixed(2)}%` : 'N/A'}
                        </span>
                      </td>
                      
                      {showTechnicals && (
                        <>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              !stock.technicals?.macd ? 'bg-gray-700 text-gray-400' :
                              stock.technicals.macd > 0 ? 'bg-green-900 text-green-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {stock.technicals?.macd ? stock.technicals.macd.toFixed(3) : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {stock.technicals?.sma_20 ? stock.technicals.sma_20.toFixed(2) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {stock.technicals?.sma_50 ? stock.technicals.sma_50.toFixed(2) : 'N/A'}
                          </td>
                        </>
                      )}
                      
                      <td className="px-6 py-4 text-gray-300">{stock.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {stocks.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {activeFilter === 'premarket' && 'لا توجد أسهم تطابق معايير البري ماركت حالياً'}
                {activeFilter === 'opening' && 'لا توجد أسهم تطابق معايير الافتتاح حالياً'}
                {activeFilter === 'swing' && 'لا توجد أسهم تطابق معايير السوينق حالياً'}
                {activeFilter === 'ema_crossover' && 'لا توجد أسهم تطابق معايير تقاطع المتوسطات حالياً'}
                {activeFilter === 'vwap' && 'لا توجد أسهم تطابق معايير VWAP حالياً'}
                {activeFilter === 'rsi' && 'لا توجد أسهم تطابق معايير RSI حالياً'}
                {activeFilter === 'open_change' && 'لا توجد أسهم تطابق معايير تغير الافتتاح حالياً'}
                {activeFilter.startsWith('custom-') && 'لا توجد أسهم تطابق معايير الأداة المخصصة حالياً'}
              </div>
            )}
          </>
        )}
      </div>

      {/* نافذة إضافة أداة مخصصة */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">إنشاء أداة مخصصة</h2>
            
            {/* صفوف الفلترة */}
            <div className="space-y-4 mb-4">
              {/* السعر */}
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-300">السعر ($)</label>
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={filterForm.priceFrom}
                    onChange={(e) => updateFilterField('priceFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={filterForm.priceTo}
                    onChange={(e) => updateFilterField('priceTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                </div>
              </div>

              {/* التغير % - مع المدة الزمنية */}
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-300">التغير %</label>
                <div className="flex-1 flex gap-2">
                  <select
                    value={filterForm.changePercent}
                    onChange={(e) => updateFilterField('changePercent', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  >
                    <option value="">اختر نسبة التغير</option>
                    {changePercentOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterForm.changeTimeframe}
                    onChange={(e) => updateFilterField('changeTimeframe', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  >
                    {timeframeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FREE FLOAT */}
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-300">FREE FLOAT</label>
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    placeholder="من (مليون)"
                    value={filterForm.freeFloatFrom}
                    onChange={(e) => updateFilterField('freeFloatFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                  <input
                    type="number"
                    placeholder="إلى (مليون)"
                    value={filterForm.freeFloatTo}
                    onChange={(e) => updateFilterField('freeFloatTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                </div>
              </div>

              {/* الڤوليوم */}
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-300">الڤوليوم</label>
                <div className="flex-1 flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={filterForm.volumeFrom}
                    onChange={(e) => updateFilterField('volumeFrom', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={filterForm.volumeTo}
                    onChange={(e) => updateFilterField('volumeTo', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Relative Volume */}
              <div className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-gray-300">Relative Volume</label>
                <div className="flex-1">
                  <select
                    value={filterForm.relativeVolume}
                    onChange={(e) => updateFilterField('relativeVolume', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  >
                    <option value="">اختر Relative Volume</option>
                    {relativeVolumeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EMA Conditions */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-3">شروط المتوسطات المتحركة</h4>
                
                {/* Timeframe */}
                <div className="flex items-center gap-4 mb-3">
                  <label className="w-32 text-sm font-medium text-gray-300">الفترة الزمنية</label>
                  <div className="flex-1">
                    <select
                      value={filterForm.emaTimeframe}
                      onChange={(e) => updateFilterField('emaTimeframe', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    >
                      {timeframeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* EMA Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterForm.ema20Condition}
                      onChange={(e) => updateFilterField('ema20Condition', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">فوق EMA 20</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterForm.ema50Condition}
                      onChange={(e) => updateFilterField('ema50Condition', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">فوق EMA 50</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterForm.ema100Condition}
                      onChange={(e) => updateFilterField('ema100Condition', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">فوق EMA 100</span>
                  </label>
                </div>
              </div>

              {/* EMA Crossovers */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-3">تقاطعات المتوسطات المتحركة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterForm.emaCrossover20_50}
                      onChange={(e) => updateFilterField('emaCrossover20_50', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">تقاطع SMA 20 فوق SMA 50</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterForm.emaCrossover50_100}
                      onChange={(e) => updateFilterField('emaCrossover50_100', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                    <span className="text-sm text-gray-300">تقاطع SMA 50 فوق SMA 100</span>
                  </label>
                </div>
              </div>

              {/* VWAP */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-3">VWAP</h4>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-300">السعر بالنسبة لـ VWAP</label>
                  <div className="flex-1">
                    <select
                      value={filterForm.vwapCondition}
                      onChange={(e) => updateFilterField('vwapCondition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    >
                      <option value="">اختر الشرط</option>
                      <option value="above">فوق VWAP</option>
                      <option value="below">تحت VWAP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RSI */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-3">RSI</h4>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-300">قيمة RSI</label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="number"
                      placeholder="من"
                      value={filterForm.rsiFrom}
                      onChange={(e) => updateFilterField('rsiFrom', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                      min="0"
                      max="100"
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      value={filterForm.rsiTo}
                      onChange={(e) => updateFilterField('rsiTo', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* تغير من الافتتاح */}
              <div className="border-t border-gray-700 pt-4">
                <h4 className="font-medium text-gray-300 mb-3">تغير من سعر الافتتاح</h4>
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-300">نسبة التغير %</label>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="أدخل نسبة التغير من الافتتاح"
                      value={filterForm.changeFromOpen}
                      onChange={(e) => updateFilterField('changeFromOpen', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={clearFilterForm}
                className="px-4 py-2 bg-gray-500 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                مسح الكل
              </button>
              <button
                onClick={applyCustomFilter}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                تطبيق الأداة
              </button>
              <button
                onClick={saveCustomFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                حفظ الأداة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ملاحظة معايير الأدوات */}
      <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
        <h3 className="font-bold text-green-300 mb-2">🎯 معايير الأدوات:</h3>
        
        {/* معايير البري ماركت */}
        {activeFilter === 'premarket' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-300">
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">1</span><span>السعر: 1$ - 10$</span></div>
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">2</span><span>FREE FLOAT: 1M - 30M</span></div>
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">3</span><span>نسبة التغيير: 10%+</span></div>
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">4</span><span>الڤوليوم: 300K+</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">5</span><span>السعر الحالي أعلى من سعر إغلاق الأمس</span></div>
          </div>
        )}

        {/* معايير الافتتاح */}
        {activeFilter === 'opening' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-300">
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">1</span><span>السعر: 1$ - 10$</span></div>
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">2</span><span>FREE FLOAT: 1M - 30M</span></div>
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">3</span><span>نسبة التغيير: 10%+</span></div>
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">4</span><span>الڤوليوم: 300K+</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">5</span><span>السعر الحالي أعلى من سعر إغلاق الأمس</span></div>
          </div>
        )}

        {/* معايير السوينق */}
        {activeFilter === 'swing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-300">
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">1</span><span>السعر: 1$ - 15$</span></div>
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">2</span><span>FREE FLOAT: 30M - 100M</span></div>
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">3</span><span>نسبة التغيير الأسبوعي: 10%+</span></div>
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">4</span><span>الڤوليوم: 300K+</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">5</span><span>متجاوزة متوسط EMA 50</span></div>
          </div>
        )}

        {/* معايير تقاطع المتوسطات */}
        {activeFilter === 'ema_crossover' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-300">
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">1</span><span>تقاطع SMA 20 فوق SMA 50</span></div>
            <div className="flex items-center gap-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">2</span><span>تقاطع SMA 50 فوق SMA 100</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-purple-800 text-purple-300 px-2 py-1 rounded text-xs">3</span><span>الاتجاه الصاعد للمتوسطات المتحركة</span></div>
          </div>
        )}

        {/* معايير VWAP */}
        {activeFilter === 'vwap' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-300">
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">1</span><span>السعر فوق VWAP</span></div>
            <div className="flex items-center gap-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">2</span><span>الحجم: 500K+</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-blue-800 text-blue-300 px-2 py-1 rounded text-xs">3</span><span>اتجاه صاعد خلال اليوم</span></div>
          </div>
        )}

        {/* معايير RSI */}
        {activeFilter === 'rsi' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-300">
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">1</span><span>RSI بين 30 و 70</span></div>
            <div className="flex items-center gap-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">2</span><span>غير مفرط في الشراء أو البيع</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-green-800 text-green-300 px-2 py-1 rounded text-xs">3</span><span>الحجم: 300K+</span></div>
          </div>
        )}

        {/* معايير تغير الافتتاح */}
        {activeFilter === 'open_change' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-300">
            <div className="flex items-center gap-2"><span className="bg-orange-800 text-orange-300 px-2 py-1 rounded text-xs">1</span><span>تغير من الافتتاح: 5%+</span></div>
            <div className="flex items-center gap-2"><span className="bg-orange-800 text-orange-300 px-2 py-1 rounded text-xs">2</span><span>الحجم: 400K+</span></div>
            <div className="flex items-center gap-2 md:col-span-2"><span className="bg-orange-800 text-orange-300 px-2 py-1 rounded text-xs">3</span><span>زخم قوي خلال تداول اليوم</span></div>
          </div>
        )}

        {/* معايير الأداة المخصصة */}
        {activeFilter.startsWith('custom-') && (
          <div className="text-sm text-purple-300">
            <span>⚙️ الأداة المخصصة - اخترنا حسب الشروط التي حددتها</span>
          </div>
        )}
      </div>

      {/* ملاحظة عامة */}
      <div className="mt-6 bg-yellow-900 border border-yellow-700 rounded-lg p-4">
        <p className="text-yellow-300 text-sm">
          💡 <strong>ملاحظة:</strong> بيانات حية - يتم تحديث البيانات كل 25 ثانية تلقائياً
        </p>
      </div>
    </div>
  );
}