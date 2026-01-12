// next-i18next.config.js (إنشاء ملف جديد في root المشروع)
module.exports = {
    i18n: {
        defaultLocale: 'ar',
        locales: ['ar', 'en'],
        localeDetection: false,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}