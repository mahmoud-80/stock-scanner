// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const publicPaths = ['/', '/login', '/register', '/subscription', '/payment/success', '/payment/cancel', '/payment/checkout'];
  const isPublicPath = publicPaths.includes(path);

  const userCookie = request.cookies.get('user');
  let user = null;

  try {
    if (userCookie?.value) {
      user = JSON.parse(userCookie.value);
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    user = null;
  }

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && !user.isSubscribed && !isPublicPath && path !== '/subscription') {
    return NextResponse.redirect(new URL('/subscription', request.url));
  }

  if (user && user.isSubscribed && user.subscriptionExpiry) {
    const expiryDate = new Date(user.subscriptionExpiry);
    const now = new Date();
    
    if (expiryDate < now) {
      const updatedUser = {
        ...user,
        isSubscribed: false,
        subscriptionStatus: 'expired',
        daysRemaining: 0
      };
      
      const response = NextResponse.redirect(new URL('/subscription?expired=true', request.url));
      response.cookies.set('user', JSON.stringify(updatedUser), {
        path: '/',
        maxAge: 30 * 24 * 60 * 60
      });
      
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // هذا معناه: طبق الـ middleware على كل المسارات إلا:
    // 1. api/ - واجهات البرمجة
    // 2. _next/static/ - الملفات الثابتة
    // 3. _next/image/ - صور Next.js
    // 4. favicon.ico - الأيقونة
    // 5. logo.* - أي ملف يبدأ بـ logo (jpeg, jpg, png, etc)
    // 6. images/ - مجلد الصور
    // 7. أي ملف ينتهي بامتداد صورة
    '/((?!api|_next/static|_next/image|favicon.ico|logo|images/|.*\\.(?:jpg|jpeg|png|svg|webp|ico|gif)$).*)',
  ],
};