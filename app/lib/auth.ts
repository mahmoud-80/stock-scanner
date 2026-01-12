// app/lib/auth.ts
import { dbService } from './database';

export class AuthService {
  async registerUser(email: string, password: string, fullName?: string): Promise<{ success: boolean; userId?: number; error?: string }> {
    try {
      console.log('📝 محاولة تسجيل مستخدم جديد:', email);

      // التحقق من صحة البريد الإلكتروني
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'البريد الإلكتروني غير صحيح' };
      }

      // التحقق من قوة كلمة المرور
      if (password.length < 6) {
        return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
      }

      // التحقق من وجود المستخدم
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        console.log('❌ البريد الإلكتروني مسجل بالفعل:', email);
        return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
      }

      // تشفير كلمة المرور
      const hashedPassword = this.simpleHash(password);

      // إنشاء المستخدم - الأنواع متوافقة الآن
      const userId = await dbService.createUser({
        email,
        password: hashedPassword,
        full_name: fullName || null,
        phone: null,
        subscription_tier: 'free',
        subscription_expiry: null,
        paylink_customer_id: null,
        is_active: true
      });

      // تسجيل النشاط
      await dbService.logUserActivity({
        user_id: userId,
        activity_type: 'register',
        description: 'تسجيل مستخدم جديد',
        ip_address: '127.0.0.1',
        user_agent: 'Browser'
      });

      console.log('✅ تم إنشاء مستخدم جديد بنجاح:', userId);
      return { success: true, userId };

    } catch (error: any) {
      console.error('❌ خطأ في التسجيل:', error);
      
      // معالجة أخطاء MySQL المحددة
      if (error.code === 'ER_DUP_ENTRY') {
        return { success: false, error: 'البريد الإلكتروني مسجل بالفعل' };
      }
      
      if (error.message === 'البريد الإلكتروني مسجل بالفعل') {
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى.' };
    }
  }

  async loginUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('🔐 محاولة تسجيل دخول:', email);

      // جلب المستخدم
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        console.log('❌ المستخدم غير موجود:', email);
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      // التحقق من كلمة المرور
      const isPasswordValid = this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        console.log('❌ كلمة المرور غير صحيحة للمستخدم:', email);
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }

      // التحقق من حالة الحساب
      if (!user.is_active) {
        console.log('❌ الحساب معطل:', email);
        return { success: false, error: 'الحساب معطل' };
      }

      // تسجيل النشاط
      await dbService.logUserActivity({
        user_id: user.id,
        activity_type: 'login',
        description: 'تسجيل دخول',
        ip_address: '127.0.0.1',
        user_agent: 'Browser'
      });

      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('✅ تسجيل دخول ناجح للمستخدم:', user.id);
      return { success: true, user: userWithoutPassword };

    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error);
      return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
    }
  }

  // دالة تجزئة بسيطة
  private simpleHash(password: string): string {
    try {
      return `hash_${Buffer.from(password).toString('base64')}_${Date.now()}`;
    } catch (error) {
      return `hash_${password}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  // التحقق من كلمة المرور
  private verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const encodedPassword = Buffer.from(password).toString('base64');
      return hashedPassword.includes(encodedPassword);
    } catch (error) {
      return hashedPassword.includes(password);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const authService = new AuthService();