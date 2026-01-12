// app/lib/database.ts
import mysql from 'mysql2/promise';




const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // لو حطيت كلمة سر للـ XAMPP ضعها هنا
  database: 'my_app_db', // غيرها لاسم قاعدة بياناتك
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// واجهات البيانات - محدثة
export interface User {
  id: number;
  email: string;
  password: string;
  full_name?: string | null;  // ✅ تحديث
  phone?: string | null;      // ✅ تحديث
  subscription_tier: 'free' | 'premium' | 'enterprise';
  subscription_expiry?: Date | null;  // ✅ تحديث
  paylink_customer_id?: string | null;  // ✅ تحديث
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: 'monthly' | 'yearly' | 'enterprise';
  amount: number;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  paylink_transaction_id?: string | null;  // ✅ تحديث
  start_date?: Date | null;  // ✅ تحديث
  end_date?: Date | null;    // ✅ تحديث
  created_at: Date;
}

export interface UserFilter {
  id: number;
  user_id: number;
  name: string;
  filter_type: string;
  conditions: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserFavorite {
  id: number;
  user_id: number;
  stock_symbol: string;
  stock_name?: string | null;  // ✅ تحديث
  notes?: string | null;       // ✅ تحديث
  created_at: Date;
}

export interface UserAlert {
  id: number;
  user_id: number;
  stock_symbol: string;
  alert_type: string;
  condition_value: number;
  is_triggered: boolean;
  is_active: boolean;
  created_at: Date;
}

export interface UserActivity {
  id: number;
  user_id: number;
  activity_type: string;
  description?: string | null;  // ✅ تحديث
  ip_address?: string | null;   // ✅ تحديث
  user_agent?: string | null;   // ✅ تحديث
  created_at: Date;
}

// إعدادات الاتصال بقاعدة البيانات
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stock_scanner',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  keepAlive: true,
  charset: 'utf8mb4'
};

export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    console.log('🔌 محاولة الاتصال بقاعدة البيانات...');
    console.log('📊 إعدادات الاتصال:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    this.pool = mysql.createPool(dbConfig);
    this.testConnection();
  }

  // اختبار الاتصال
  private async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
      
      // اختبار استعلام بسيط
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ اختبار الاستعلام ناجح:', rows);
      
      connection.release();
    } catch (error) {
      console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
      console.log('🔧 تأكد من:');
      console.log('   - تشغيل MySQL');
      console.log('   - صحة كلمة المرور');
      console.log('   - وجود قاعدة البيانات المطلوبة');
    }
  }

  // === إدارة المستخدمين ===

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );
      return (rows as User[])[0] || null;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدم بالإيميل:', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
        [id]
      );
      return (rows as User[])[0] || null;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدم بالرقم:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    try {
      console.log('📋 بيانات المستخدم المستقبلة:', {
        email: userData.email,
        full_name: userData.full_name,
        subscription_tier: userData.subscription_tier
      });
      
      const [result] = await this.pool.execute(
        `INSERT INTO users (email, password, full_name, phone, subscription_tier, subscription_expiry, paylink_customer_id, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.email, 
          userData.password, 
          userData.full_name || null, 
          userData.phone || null, 
          userData.subscription_tier, 
          userData.subscription_expiry || null, 
          userData.paylink_customer_id || null, 
          userData.is_active
        ]
      );
      
      const insertId = (result as mysql.ResultSetHeader).insertId;
      console.log('✅ تم إنشاء مستخدم جديد برقم:', insertId);
      return insertId;
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء مستخدم:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('البريد الإلكتروني مسجل بالفعل');
      }
      
      throw error;
    }
  }

  async updateUserSubscription(userId: number, tier: string, expiry: Date): Promise<void> {
    try {
      await this.pool.execute(
        'UPDATE users SET subscription_tier = ?, subscription_expiry = ? WHERE id = ?',
        [tier, expiry, userId]
      );
      console.log('✅ تم تحديث اشتراك المستخدم:', userId);
    } catch (error) {
      console.error('❌ خطأ في تحديث اشتراك المستخدم:', error);
      throw error;
    }
  }

  // === إدارة الاشتراكات ===

  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at'>): Promise<number> {
    try {
      const [result] = await this.pool.execute(
        `INSERT INTO subscriptions (user_id, plan_type, amount, status, paylink_transaction_id, start_date, end_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          subscription.user_id,
          subscription.plan_type, 
          subscription.amount,
          subscription.status,
          subscription.paylink_transaction_id || null,
          subscription.start_date || null,
          subscription.end_date || null
        ]
      );
      const insertId = (result as mysql.ResultSetHeader).insertId;
      console.log('✅ تم إنشاء اشتراك جديد برقم:', insertId);
      return insertId;
    } catch (error) {
      console.error('❌ خطأ في إنشاء اشتراك:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: number): Promise<Subscription | null> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      return (rows as Subscription[])[0] || null;
    } catch (error) {
      console.error('❌ خطأ في جلب اشتراك المستخدم:', error);
      return null;
    }
  }

  // === إدارة الفلاتر المخصصة ===

  async getUserFilters(userId: number): Promise<UserFilter[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM user_filters WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC',
        [userId]
      );
      return rows as UserFilter[];
    } catch (error) {
      console.error('❌ خطأ في جلب فلاتر المستخدم:', error);
      return [];
    }
  }

  async createUserFilter(filter: Omit<UserFilter, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO user_filters (user_id, name, filter_type, conditions, is_active) VALUES (?, ?, ?, ?, ?)',
        [filter.user_id, filter.name, filter.filter_type, JSON.stringify(filter.conditions), filter.is_active]
      );
      const insertId = (result as mysql.ResultSetHeader).insertId;
      console.log('✅ تم إنشاء فلتر جديد برقم:', insertId);
      return insertId;
    } catch (error) {
      console.error('❌ خطأ في إنشاء فلتر:', error);
      throw error;
    }
  }

  // === إدارة المفضلة ===

  async getUserFavorites(userId: number): Promise<UserFavorite[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows as UserFavorite[];
    } catch (error) {
      console.error('❌ خطأ في جلب مفضلات المستخدم:', error);
      return [];
    }
  }

  async addUserFavorite(favorite: Omit<UserFavorite, 'id' | 'created_at'>): Promise<number> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO user_favorites (user_id, stock_symbol, stock_name, notes) VALUES (?, ?, ?, ?)',
        [favorite.user_id, favorite.stock_symbol, favorite.stock_name || null, favorite.notes || null]
      );
      const insertId = (result as mysql.ResultSetHeader).insertId;
      console.log('✅ تم إضافة سهم للمفضلة برقم:', insertId);
      return insertId;
    } catch (error) {
      console.error('❌ خطأ في إضافة سهم للمفضلة:', error);
      throw error;
    }
  }

  async removeUserFavorite(userId: number, stockSymbol: string): Promise<boolean> {
    try {
      const [result] = await this.pool.execute(
        'DELETE FROM user_favorites WHERE user_id = ? AND stock_symbol = ?',
        [userId, stockSymbol]
      );
      const success = (result as mysql.ResultSetHeader).affectedRows > 0;
      if (success) {
        console.log('✅ تم حذف السهم من المفضلة:', stockSymbol);
      }
      return success;
    } catch (error) {
      console.error('❌ خطأ في حذف سهم من المفضلة:', error);
      return false;
    }
  }

  // === إدارة النشاط ===

  async logUserActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<number> {
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO user_activity (user_id, activity_type, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [
          activity.user_id, 
          activity.activity_type, 
          activity.description || null, 
          activity.ip_address || null, 
          activity.user_agent || null
        ]
      );
      const insertId = (result as mysql.ResultSetHeader).insertId;
      return insertId;
    } catch (error) {
      console.error('❌ خطأ في تسجيل النشاط:', error);
      throw error;
    }
  }

  async getUserActivities(userId: number, limit: number = 10): Promise<UserActivity[]> {
    try {
      const [rows] = await this.pool.execute(
        'SELECT * FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
      return rows as UserActivity[];
    } catch (error) {
      console.error('❌ خطأ في جلب نشاط المستخدم:', error);
      return [];
    }
  }

  // === أدوات مساعدة ===

  async closeConnection(): Promise<void> {
    await this.pool.end();
    console.log('🔌 تم إغلاق الاتصال بقاعدة البيانات');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const [result] = await this.pool.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ فشل فحص صحة قاعدة البيانات:', error);
      return false;
    }
  }
}

// إنشاء نسخة واحدة من الخدمة
export const dbService = new DatabaseService();