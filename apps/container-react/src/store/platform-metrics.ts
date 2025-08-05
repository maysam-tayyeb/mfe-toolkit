import { getGlobalStateManager } from '@mfe-toolkit/state';

export type PlatformMetrics = {
  bundleReduction: number;
  frameworkAgnostic: boolean;
  demonstratedFrameworks: string[];
  stateSyncLatency: number;
  typeSafetyCoverage: number;
  activeMFEs: number;
  totalMFEs: number;
  eventBusMessages: number;
  errorCount: number;
};

const defaultMetrics: PlatformMetrics = {
  bundleReduction: 97,
  frameworkAgnostic: true,
  demonstratedFrameworks: ['React', 'Vue', 'Vanilla JS', 'Any JS Framework'],
  stateSyncLatency: 0,
  typeSafetyCoverage: 100,
  activeMFEs: 0,
  totalMFEs: 0,
  eventBusMessages: 0,
  errorCount: 0,
};

export function initializePlatformMetrics() {
  const stateManager = getGlobalStateManager();

  // Initialize with default values if not already set
  const existingMetrics = stateManager.get('platformMetrics') as PlatformMetrics | null;
  if (!existingMetrics) {
    stateManager.set('platformMetrics', defaultMetrics);
  } else {
    // Merge with defaults to ensure all keys exist
    stateManager.set('platformMetrics', {
      ...defaultMetrics,
      ...existingMetrics,
    });
  }

  return stateManager;
}

export function updatePlatformMetric<K extends keyof PlatformMetrics>(
  key: K,
  value: PlatformMetrics[K]
) {
  const stateManager = getGlobalStateManager();
  const currentMetrics = (stateManager.get('platformMetrics') as PlatformMetrics) || defaultMetrics;

  stateManager.set('platformMetrics', {
    ...currentMetrics,
    [key]: value,
  });
}

export function incrementEventBusMessages() {
  const stateManager = getGlobalStateManager();
  const currentMetrics = (stateManager.get('platformMetrics') as PlatformMetrics) || defaultMetrics;

  stateManager.set('platformMetrics', {
    ...currentMetrics,
    eventBusMessages: currentMetrics.eventBusMessages + 1,
  });
}

export function incrementErrorCount() {
  const stateManager = getGlobalStateManager();
  const currentMetrics = (stateManager.get('platformMetrics') as PlatformMetrics) || defaultMetrics;

  stateManager.set('platformMetrics', {
    ...currentMetrics,
    errorCount: currentMetrics.errorCount + 1,
  });
}
