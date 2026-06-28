import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getStatsRank } from '../services/api';

const StatsRankContext = createContext(null);

const POLL_MS = 5000;

export const StatsRankProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [rank, setRank] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const refreshRank = useCallback(async () => {
    if (!isAuthenticated) {
      setRank(null);
      setLoaded(true);
      return;
    }

    try {
      const response = await getStatsRank();
      setRank(response.data.rank);
    } catch {
      setRank(null);
    } finally {
      setLoaded(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRank(null);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    refreshRank();

    const interval = setInterval(refreshRank, POLL_MS);
    const onFocus = () => refreshRank();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshRank();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, refreshRank]);

  return (
    <StatsRankContext.Provider value={{ rank, loaded, refreshRank }}>
      {children}
    </StatsRankContext.Provider>
  );
};

export const useStatsRank = () => {
  const context = useContext(StatsRankContext);
  if (!context) {
    throw new Error('useStatsRank must be used within a StatsRankProvider');
  }
  return context;
};
