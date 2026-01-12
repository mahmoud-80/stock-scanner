// app/filters/page.tsx - الجزء المحدث للفلاتر المخصصة
'use client';
import { useState, useEffect } from 'react';

interface Filter {
  id: string;
  name: string;
  description: string;
  category: string;
}

// قائمة الفلاتر الجاهزة للاختيار منها
const availableFilters: Filter[] = [
  // فلاتر سعرية
  { id: 'under-10', name: 'أسهم تحت 10$', description: 'أسهم بسعر أقل من 10 دولار', category: 'سعرية' },
  { id: 'under-50', name: 'أسهم تحت 50$', description: 'أسهم بسعر أقل من 50 دولار', category: 'سعرية' },
  { id: 'over-100', name: 'أسهم فوق 100$', description: 'أسهم بسعر أعلى من 100 دولار', category: 'سعرية' },
  { id: 'penny-stocks', name: 'أسهم بيني', description: 'أسهم بسعر منخفض (تحت 5$)', category: 'سعرية' },
  { id: 'blue-chips', name: 'الأسهم الزرقاء', description: 'أسهم كبرى مستقرة', category: 'سعرية' },
  
  // فلاتر تقنية
  { id: 'rsi-oversold', name: 'RSI ذروة بيع', description: 'RSI أقل من 30 (ذروة بيع)', category: 'تقنية' },
  { id: 'rsi-overbought', name: 'RSI ذروة شراء', description: 'RSI أعلى من 70 (ذروة شراء)', category: 'تقنية' },
  { id: 'rsi-neutral', name: 'RSI متعادل', description: 'RSI بين 30 و 70', category: 'تقنية' },
  { id: 'macd-bullish', name: 'MACD صاعد', description: 'MACD فوق الصفر (إشارة صاعدة)', category: 'تقنية' },
  { id: 'macd-bearish', name: 'MACD هابط', description: 'MACD تحت الصفر (إشارة هابطة)', category: 'تقنية' },
  { id: 'golden-cross', name: 'التقاطع الذهبي', description: 'المتوسط 50 يتخطى المتوسط 200', category: 'تقنية' },
  { id: 'death-cross', name: 'التقاطع المميت', description: 'المتوسط 200 يتخطى المتوسط 50', category: 'تقنية' },
  
  // فلاتر حجم تداول
  { id: 'volume-spike', name: 'قفزة حجم التداول', description: 'حجم تداول أعلى من المتوسط', category: 'حجم' },
  { id: 'low-float', name: 'أسهم قليلة الطفو', description: 'أسهم بعدد أسهم متداولة قليل', category: 'حجم' },
  { id: 'high-float', name: 'أسهم عالية الطفو', description: 'أسهم بعدد أسهم متداولة كبير', category: 'حجم' },
  
  // فلاتر شرعية وإسلامية
  { id: 'sharia-compliant', name: 'متوافقة مع الشريعة', description: 'أسهم متوافقة مع أحكام الشريعة الإسلامية', category: 'شرعية' },
  { id: 'halal-only', name: 'حلال فقط', description: 'أسهم في أنشطة حلال فقط', category: 'شرعية' },
  { id: 'no-interest', name: 'خالية من الربا', description: 'أسهم في شركات لا تتعامل بالربا', category: 'شرعية' },
  
  // فلاتر توقيت
  { id: 'pre-market-gainers', name: 'صاعدي ما قبل السوق', description: 'أسهم صاعدة في تداولات ما قبل السوق', category: 'توقيت' },
  { id: 'after-hours', name: 'تداولات ما بعد السوق', description: 'أسهم نشطة في تداولات ما بعد السوق', category: 'توقيت' },
  { id: 'weekend-gappers', name: 'فجوات نهاية الأسبوع', description: 'أسهم ذات فجوات سعرية من إغلاق الجمعة', category: 'توقيت' },
  
  // فلاتر قطاعية
  { id: 'technology', name: 'قطاع التكنولوجيا', description: 'أسهم شركات التكنولوجيا والبرمجيات', category: 'قطاعات' },
  { id: 'healthcare', name: 'قطاع الرعاية الصحية', description: 'أسهم شركات الأدوية والمستشفيات', category: 'قطاعات' },
  { id: 'energy', name: 'قطاع الطاقة', description: 'أسهم شركات النفط والغاز والطاقة', category: 'قطاعات' },
  { id: 'financial', name: 'قطاع الخدمات المالية', description: 'أسهم البنوك وشركات التأمين', category: 'قطاعات' },
  { id: 'consumer', name: 'قطاع السلع الاستهلاكية', description: 'أسهم شركات التجزئة والسلع', category: 'قطاعات' },
  
  // فلاتر تذبذب
  { id: 'high-volatility', name: 'عالية التذبذب', description: 'أسهم ذات تقلبات سعرية عالية', category: 'تذبذب' },
  { id: 'low-volatility', name: 'منخفضة التذبذب', description: 'أسهم مستقرة ذات تقلبات منخفضة', category: 'تذبذب' },
  { id: 'volatility-breakout', name: 'اختراق التذبذب', description: 'أسهم تخترق نطاق التذبذب', category: 'تذبذب' },
  
  // فلاتر أرباح
  { id: 'dividend-stocks', name: 'أسهم توزع أرباح', description: 'أسهم توزع أرباح نقدية', category: 'أرباح' },
  { id: 'high-dividend', name: 'عوائد أرباح عالية', description: 'أسهم ذات عوائد أرباح مرتفعة', category: 'أرباح' },
  { id: 'dividend-growth', name: 'نمو الأرباح', description: 'أسهم زادت توزيعاتها باستمرار', category: 'أرباح' },
  
  // فلاتر زخم
  { id: 'momentum-up', name: 'زخم صاعد', description: 'أسهم ذات زخم شرائي قوي', category: 'زخم' },
  { id: 'momentum-down', name: 'زخم هابط', description: 'أسهم ذات زخم بيعي قوي', category: 'زخم' },
  { id: 'momentum-reversal', name: 'انعكاس زخم', description: 'أسهم يشير زخمها لانعكاس قريب', category: 'زخم' }
];

// تصنيف الفلاتر
const filterCategories = [
  'سعرية', 'تقنية', 'حجم', 'شرعية', 'توقيت', 'قطاعات', 'تذبذب', 'أرباح', 'زخم'
];

export default function FiltersPage() {
  const [customFilters, setCustomFilters] = useState<Filter[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('كل الفئات');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // تصفية الفلاتر المتاحة حسب البحث والفئة
  const filteredAvailableFilters = availableFilters.filter(filter => {
    const matchesCategory = selectedCategory === 'كل الفئات' || filter.category === selectedCategory;
    const matchesSearch = filter.name.includes(searchTerm) || filter.description.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // إضافة فلتر مخصص
  const addCustomFilter = () => {
    if (selectedFilterId) {
      const selectedFilter = availableFilters.find(f => f.id === selectedFilterId);
      if (selectedFilter && !customFilters.find(f => f.id === selectedFilter.id)) {
        setCustomFilters([...customFilters, selectedFilter]);
        setSelectedFilterId('');
      }
    }
  };

  // تطبيق الفلتر
  const applyFilter = async (filterId: string) => {
    try {
      window.location.href = `/stocks?filter=${filterId}`;
    } catch (error) {
      console.error('Error applying filter:', error);
      alert('حدث خطأ في تطبيق الفلتر. يرجى المحاولة مرة أخرى.');
    }
  };

  // الفلاتر الجاهزة الأساسية
  const presetFilters: Filter[] = [
    { id: 'all', name: 'جميع الأسهم', description: 'عرض كل الأسهم المتاحة', category: 'أساسية' },
    { id: 'premarket', name: 'انفجارات البري ماركت', description: 'أسهم ذات ارتفاع قوي في التداول قبل السوق', category: 'توقيت' },
    { id: 'breakouts', name: 'اختراقات يومية', description: 'أسهم تخترق مستويات مقاومة مهمة', category: 'تقنية' },
    { id: 'sharia', name: 'الأسهم الشرعية', description: 'أسهم متوافقة مع الشريعة الإسلامية', category: 'شرعية' },
    { id: 'gainers', name: 'الصاعدين فقط', description: 'الأسهم ذات الأداء الإيجابي اليوم', category: 'سعرية' },
    { id: 'losers', name: 'الهابطين فقط', description: 'الأسهم ذات الأداء السلبي اليوم', category: 'سعرية' },
    { id: 'high-volume', name: 'عالية السيولة', description: 'أسهم ذات أحجام تداول عالية', category: 'حجم' },
  ];

  if (!isClient) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-md border">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة الفلاتر</h1>

      {/* الفلاتر الجاهزة */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">الفلاتر الجاهزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presetFilters.map(filter => (
            <div key={filter.id} className="bg-white p-4 rounded-lg shadow-md border">
              <h3 className="font-bold text-lg mb-2">{filter.name}</h3>
              <p className="text-gray-600 mb-3">{filter.description}</p>
              <button 
                onClick={() => applyFilter(filter.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                تطبيق الفلتر
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* الفلاتر المخصصة */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">الفلاتر المخصصة</h2>
        
        {/* إضافة فلتر جديد */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold mb-3">إضافة فلتر مخصص</h3>
          
          {/* فلتر البحث */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن فلتر..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
          </div>

          {/* فئات الفلاتر */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedCategory('كل الفئات')}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === 'كل الفئات' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              كل الفئات
            </button>
            {filterCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* قائمة الفلاتر للاختيار */}
          <div className="mb-4">
            <select
              value={selectedFilterId}
              onChange={(e) => setSelectedFilterId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر فلتر من القائمة...</option>
              {filteredAvailableFilters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.name} - {filter.description}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={addCustomFilter}
            disabled={!selectedFilterId}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            إضافة إلى الفلاتر المخصصة
          </button>
        </div>

        {/* قائمة الفلاتر المخصصة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customFilters.map(filter => (
            <div key={filter.id} className="bg-white p-4 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{filter.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {filter.category}
                  </span>
                </div>
                <button 
                  onClick={() => setCustomFilters(customFilters.filter(f => f.id !== filter.id))}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-3">{filter.description}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => applyFilter(filter.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  تطبيق
                </button>
              </div>
            </div>
          ))}
          
          {customFilters.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              لم تقم بإضافة أي فلاتر مخصصة حتى الآن
            </div>
          )}
        </div>
      </div>

      {/* إحصائيات */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">إحصائيات الفلاتر</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-blue-600">{availableFilters.length}</div>
            <div>إجمالي الفلاتر المتاحة</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{customFilters.length}</div>
            <div>الفلاتر المضافة</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-purple-600">{filterCategories.length}</div>
            <div>عدد الفئات</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-orange-600">{presetFilters.length}</div>
            <div>فلاتر جاهزة</div>
          </div>
        </div>
      </div>
    </div>
  );
}