// app/page.tsx
'use client';
import { useEffect, useState } from 'react';

// ترجمة النصوص للصفحة الرئيسية
const homeTranslations = {
  ar: {
    title: '🚀 Trend spx - منصة فلترة الأسهم المتقدمة',
    description: 'اكتشف الفرص الاستثمارية باستخدام أدوات الفلترة المتطورة والبيانات اللحظية',
    about: 'Trend spx هي منصة متطورة لفلترة الأسهم باستخدام أحدث التقنيات والبيانات المباشرة من الأسواق العالمية. نوفر لك أدوات متقدمة لاكتشاف الفرص الاستثمارية في الوقت المناسب.',
    features: {
      realtime: '📊 بيانات لحظية',
      realtimeDesc: 'أسعار مباشرة محدثة كل 15 ثانية',
      filters: '🔍 أدوات متقدمة',
      filtersDesc: 'أدوات جاهزة ومخصصة لاكتشاف الفرص',
      analysis: '📈 تحليلات فنية',
      analysisDesc: 'مؤشرات فنية متقدمة'
    },
    cta: 'ابدأ التصفية الآن'
  },
  en: {
    title: '🚀 Trend spx - Advanced Stock Screening Platform',
    description: 'Discover investment opportunities with advanced screening tools and real-time data',
    about: 'Trend spx is an advanced stock screening platform using cutting-edge technologies and real-time market data. We provide you with advanced tools to discover investment opportunities at the right time.',
    features: {
      realtime: '📊 Real-time Data',
      realtimeDesc: 'Live prices updated every 15 seconds',
      filters: '🔍 Advanced Tools',
      filtersDesc: 'Ready-made and custom tools to discover opportunities',
      analysis: '📈 Technical Analysis',
      analysisDesc: 'Advanced technical indicators'
    },
    cta: 'Start Screening Now'
  }
};

export default function Home() {
  const [currentLang, setCurrentLang] = useState('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setCurrentLang(savedLang);
  }, []);

  const t = homeTranslations[currentLang as keyof typeof homeTranslations];

  return (
    <div className="py-12 bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 text-center">
        {/* صورة اللوجو الكبيرة في الصفحة الرئيسية */}
        <div className="flex flex-col items-center justify-center mb-12">
          {/* صورة اللوجو الكبيرة */}
          <div className="mb-8">
            <img 
              src="/images/logo.jpeg" 
              alt="TRENDSPX Logo" 
              style={{
                height: '180px',
                width: 'auto',
                maxWidth: '450px',
                margin: '0 auto'
              }}
              onError={(e) => {
                console.log("صورة اللوجو مش موجودة");
                e.currentTarget.src = "/images/logo.jpg";
              }}
            />
          </div>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-2">
            {currentLang === 'ar' 
              ? 'منصة متقدمة لفلترة وتصفية الأسهم باستخدام أحدث التقنيات' 
              : 'Advanced stock screening platform using cutting-edge technology'
            }
          </p>
        </div>
        
        <h2 className="text-4xl font-bold mb-6 text-white mt-4">
          {t.title}
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          {t.description}
        </p>
        
        {/* نبذة عن الموقع */}
        <div className="card max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-bold mb-4 text-blue-400">
            {currentLang === 'ar' ? 'عن Trend spx' : 'About Trend spx'}
          </h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            {t.about}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card hover:shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-white">{t.features.realtime}</h3>
            <p className="text-gray-300">{t.features.realtimeDesc}</p>
          </div>
          <div className="card hover:shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-white">{t.features.filters}</h3>
            <p className="text-gray-300">{t.features.filtersDesc}</p>
          </div>
          <div className="card hover:shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-white">{t.features.analysis}</h3>
            <p className="text-gray-300">{t.features.analysisDesc}</p>
          </div>
        </div>

        <a 
          href="/stocks" 
          className="btn-primary text-lg px-10 py-4 inline-block"
        >
          {t.cta}
        </a>
        
        {/* فاصل زخرفي */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            {currentLang === 'ar' 
              ? '💡 ابدأ رحلتك الاستثمارية مع أدواتنا المتقدمة' 
              : '💡 Start your investment journey with our advanced tools'}
          </p>
        </div>
      </div>
    </div>
  );
}