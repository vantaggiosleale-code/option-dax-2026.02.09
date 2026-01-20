import { create } from 'zustand';
import { MarketData } from '../types';

interface MarketDataStore {
  marketData: MarketData;
  setMarketData: (data: MarketData | ((prev: MarketData) => MarketData)) => void;
  refreshDaxSpot: () => Promise<void>;
  isLoadingSpot: boolean;
}

export const useMarketDataStore = create<MarketDataStore>((set, get) => ({
  marketData: {
    daxSpot: 21885.79,
    riskFreeRate: 2.61,
  },
  isLoadingSpot: false,
  
  setMarketData: (data) => {
    if (typeof data === 'function') {
      set((state) => ({ marketData: data(state.marketData) }));
    } else {
      set({ marketData: data });
    }
  },
  
  refreshDaxSpot: async () => {
    set({ isLoadingSpot: true });
    try {
      const response = await fetch('/api/trpc/marketData.getDaxPrice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      // Dopo aver disabilitato superjson, il formato è cambiato
      const price = data.result?.data?.price || data.result?.data?.json?.price;
      console.log('Prezzo DAX aggiornato:', price);
      
      if (price) {
        set((state) => ({
          marketData: {
            ...state.marketData,
            daxSpot: price
          }
        }));
      }
    } catch (e) {
      console.error('Errore aggiornamento prezzo DAX:', e);
    } finally {
      set({ isLoadingSpot: false });
    }
  },
}));
