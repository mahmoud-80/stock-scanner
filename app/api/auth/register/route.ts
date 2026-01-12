// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    console.log('📝 محاولة تسجيل مستخدم:', email);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const result = await authService.registerUser(email, password, fullName);

    if (result.success) {
      console.log('✅ تم إنشاء حساب جديد:', result.userId);
      
      // جلب بيانات المستخدم بعد التسجيل
      const user = await authService.loginUser(email, password);
      
      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        userId: result.userId,
        user: user.success ? user.user : null
      });
    } else {
      console.log('❌ فشل التسجيل:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في السيرفر' },
      { status: 500 }
    );
  }
}