import React, { createContext, useContext, useEffect, useState } from 'react';
import { GlobalEconomy, GlobalEventType } from '../types';
import { apiService } from '../services/apiService';
import { ECONOMY_CONFIG } from '../constants';

interface GlobalEconomyContextType {
  economy: GlobalEconomy | null;
  isLoading: boolean;
  error: string | null;
  refreshEconomy: () => Promise<void>;
  watchAdGlobalEffect: () => Promise<void>;
  updateEconomyEvent: (event: GlobalEventType) => void;
}

const GlobalEconomyContext = createContext<GlobalEconomyContextType | undefined>(undefined);

export const GlobalEconomyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [economy, setEconomy] = useState<GlobalEconomy | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEconomy = async () => {
    try {
      const data = await apiService.getGlobalEconomy();
      // Inject current local event if not already set (simulating backend)
      if (!economy) {
          (data as any).currentEvent = GlobalEventType.NONE;
      } else {
          (data as any).currentEvent = economy.currentEvent;
      }
      setEconomy(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch global economy', err);
      setError('Sunucu bağlantısı kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomy();
    const interval = setInterval(fetchEconomy, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshEconomy = async () => {
    setIsLoading(true);
    await fetchEconomy();
  };

  const updateEconomyEvent = (event: GlobalEventType) => {
    if (economy) {
        setEconomy({ ...economy, currentEvent: event });
    }
  };

  const watchAdGlobalEffect = async () => {
    if (economy) {
      setEconomy(prev => prev ? ({
        ...prev,
        totalAdViewsToday: prev.totalAdViewsToday + 1
      }) : null);
    }
  };

  return (
    <GlobalEconomyContext.Provider value={{ economy, isLoading, error, refreshEconomy, watchAdGlobalEffect, updateEconomyEvent }}>
      {children}
    </GlobalEconomyContext.Provider>
  );
};

export const useGlobalEconomy = () => {
  const context = useContext(GlobalEconomyContext);
  if (context === undefined) {
    throw new Error('useGlobalEconomy must be used within a GlobalEconomyProvider');
  }
  return context;
};