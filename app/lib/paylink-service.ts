// app/lib/paylink-service.ts
const PAYLINK_APP_ID = process.env.NEXT_PUBLIC_PAYLINK_APP_ID;
const PAYLINK_API_KEY = process.env.NEXT_PUBLIC_PAYLINK_API_KEY;
const PAYLINK_BASE_URL = process.env.NEXT_PUBLIC_PAYLINK_BASE_URL;

export interface PaymentRequest {
  amount: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  products: Product[];
  returnUrl: string;
  cancelUrl: string;
}

export interface Product {
  title: string;
  price: number;
  qty: number;
  description?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionNo?: string;
  url?: string;
  message?: string;
  error?: string;
}

export class PaylinkService {
  private baseURL = PAYLINK_BASE_URL;

  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/addInvoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'identity': PAYLINK_APP_ID!,
          'token': PAYLINK_API_KEY!
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          orderNumber: paymentData.orderNumber,
          callBackUrl: paymentData.returnUrl,
          cancelUrl: paymentData.cancelUrl,
          clientName: paymentData.customerName,
          clientEmail: paymentData.customerEmail,
          clientMobile: paymentData.customerMobile,
          products: paymentData.products,
          lang: 'ar'
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          transactionNo: data.transactionNo,
          url: data.url,
          message: 'تم إنشاء طلب الدفع بنجاح'
        };
      } else {
        return {
          success: false,
          error: data.message || 'فشل في إنشاء طلب الدفع'
        };
      }
    } catch (error) {
      console.error('Paylink API error:', error);
      return {
        success: false,
        error: 'حدث خطأ في الاتصال ببوابة الدفع'
      };
    }
  }

  async verifyPayment(transactionNo: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/getInvoice/${transactionNo}`, {
        method: 'GET',
        headers: {
          'identity': PAYLINK_APP_ID!,
          'token': PAYLINK_API_KEY!
        }
      });

      const data = await response.json();

      if (data.success && data.orderStatus === 'تم الدفع') {
        return {
          success: true,
          message: 'تم الدفع بنجاح'
        };
      } else {
        return {
          success: false,
          error: data.message || 'لم يتم الدفع بعد'
        };
      }
    } catch (error) {
      console.error('Paylink verification error:', error);
      return {
        success: false,
        error: 'حدث خطأ في التحقق من حالة الدفع'
      };
    }
  }
}

export const paylinkService = new PaylinkService();