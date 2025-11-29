export interface PriceData {
  symbol: string;
  category: string;
  bid: number | null; // Alış
  ask: number | null; // Satış
  description?: string;
  source?: string;
  timestamp: string;
  // UI için değişim yönü (opsiyonel)
  direction?: 'up' | 'down' | 'stable'; 
}