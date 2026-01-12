// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isSubscribed: boolean;
  subscriptionType: 'monthly' | 'quarterly' | 'yearly' | null;
  subscriptionStart: string;
  subscriptionExpiry: string;
  subscriptionStatus: 'active' | 'expired' | 'cancelled';
  daysRemaining: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}