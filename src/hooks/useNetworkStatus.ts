import { useState, useEffect } from 'react';
import { syncService, SyncStatusReport } from '../db/syncService';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncReport, setSyncReport] = useState<SyncStatusReport>({
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    error: null
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncService.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = syncService.subscribe((report) => {
      setSyncReport(report);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const triggerManualSync = () => {
    syncService.processQueue();
  };

  return {
    isOnline,
    ...syncReport,
    triggerManualSync
  };
}
