import { useEffect, useState } from 'react';
import { getGlobalStateManager } from '@mfe/universal-state';
import type { PlatformMetrics } from '@/store/platform-metrics';

export function usePlatformMetrics() {
  const stateManager = getGlobalStateManager();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(
    stateManager.get('platformMetrics') as PlatformMetrics | null
  );

  useEffect(() => {
    // Subscribe to platform metrics changes
    const unsubscribe = stateManager.subscribe('platformMetrics', (value) => {
      setMetrics(value as PlatformMetrics);
    });

    // Get initial value
    const currentMetrics = stateManager.get('platformMetrics') as PlatformMetrics | null;
    if (currentMetrics) {
      setMetrics(currentMetrics);
    }

    return unsubscribe;
  }, []);

  return metrics;
}
