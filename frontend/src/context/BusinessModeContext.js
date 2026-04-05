import { createContext, useContext, useState, useCallback } from 'react';

const BusinessModeContext = createContext(null);

export function BusinessModeProvider({ children }) {
  const [mode, setModeState] = useState(
    () => localStorage.getItem('erp_business_mode') || null
  );

  const setMode = useCallback((newMode) => {
    localStorage.setItem('erp_business_mode', newMode);
    setModeState(newMode);
  }, []);

  const clearMode = useCallback(() => {
    localStorage.removeItem('erp_business_mode');
    setModeState(null);
  }, []);

  return (
    <BusinessModeContext.Provider value={{
      businessMode: mode,
      setBusinessMode: setMode,
      clearMode,
      isYarn:       mode === 'YARN',
      isChemical:   mode === 'CHEMICAL',
      isOperations: mode === 'OPERATIONS',
    }}>
      {children}
    </BusinessModeContext.Provider>
  );
}

export function useBusinessMode() {
  const ctx = useContext(BusinessModeContext);
  if (!ctx) throw new Error('useBusinessMode must be used inside BusinessModeProvider');
  return ctx;
}