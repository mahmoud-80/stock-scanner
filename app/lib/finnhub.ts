// lib/finnhub.ts
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

export interface TechnicalIndicator {
  symbol: string;
  rsi?: number;
  macd?: number;
  sma_20?: number;
  sma_50?: number;
  sma_200?: number;
  volume_avg?: number;
  vwap?: number;
}

export class FinnhubService {
  private baseURL = 'https://finnhub.io/api/v1';

  async getRealTimeQuote(symbol: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
        { next: { revalidate: 30 } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quote for ${symbol}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator> {
    try {
      // محاكاة للحصول على بيانات تقنية واقعية
      const base = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
      
      return {
        symbol,
        rsi: 30 + (base % 50),
        macd: -1 + (base % 2),
        sma_20: undefined,
        sma_50: undefined,
        sma_200: undefined,
        volume_avg: 500000 + (base % 2000000),
        vwap: undefined
      };
    } catch (error) {
      console.error(`Error fetching technical indicators for ${symbol}:`, error);
      return {
        symbol,
        rsi: undefined,
        macd: undefined,
        sma_20: undefined,
        sma_50: undefined,
        sma_200: undefined,
        volume_avg: undefined,
        vwap: undefined
      };
    }
  }
}

export const finnhubService = new FinnhubService();