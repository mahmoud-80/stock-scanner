// lib/payment.ts
const PAYLINK_API_KEY = process.env.PAYLINK_API_KEY || 'your_paylink_api_key';
const PAYLINK_BASE_URL = 'https://restapi.paylink.sa/api';

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  callBackUrl: string;
  cancelBackUrl: string;
  clientName: string;
  note: string;
  products: Array<{
    title: string;
    price: number;
    qty: number;
    description?: string;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  transactionNo: string;
  url: string;
  message?: string;
}

export class PaylinkService {
  private apiKey: string;

  constructor() {
    this.apiKey = PAYLINK_API_KEY;
  }

  async createPayment(orderData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${PAYLINK_BASE_URL}/addInvoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          transactionNo: data.transactionNo,
          url: data.url,
          message: data.message
        };
      } else {
        return {
          success: false,
          transactionNo: '',
          url: '',
          message: data.message || 'Payment creation failed'
        };
      }
    } catch (error) {
      console.error('Paylink API error:', error);
      return {
        success: false,
        transactionNo: '',
        url: '',
        message: 'Network error occurred'
      };
    }
  }

  async verifyPayment(transactionNo: string): Promise<boolean> {
    try {
      const response = await fetch(`${PAYLINK_BASE_URL}/getInvoice/${transactionNo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const data = await response.json();
      return data.orderStatus === 'Paid';
    } catch (error) {
      console.error('Paylink verification error:', error);
      return false;
    }
  }
}

export const paylinkService = new PaylinkService();