import { create } from 'zustand';
import { MarketData } from '../types';

interface MarketDataStore {
  marketData: MarketData;
  setMarketData: (data: MarketData | ((prev: MarketData) => MarketData)) => void;
}

export const useMarketDataStore = create<MarketDataStore>((set) => ({
  marketData: {
    daxSpot: 21885.79,
    riskFreeRate: 2.61,
  },
  
  setMarketData: (data) => {
    if (typeof data === 'function') {
      set((state) => ({ marketData: data(state.marketData) }));
    } else {
      set({ marketData: data });
    }
  },
}));
