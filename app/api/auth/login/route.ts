// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 محاولة تسجيل دخول:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const result = await authService.loginUser(email, password);

    if (result.success && result.user) {
      console.log('✅ تسجيل دخول ناجح للمستخدم:', result.user.email);
      
      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: result.user
      });
    } else {
      console.log('❌ فشل تسجيل الدخول:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في السيرفر' },
      { status: 500 }
    );
  }
}