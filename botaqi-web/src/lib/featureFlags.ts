export function getClientFlags(): Record<string, boolean> {
  // Prefer server-injected global, then Vite env fallback
  // `window.__FEATURE_FLAGS__` can be set by server embed if desired
  // Minimal: return a few defaults aligned with Phase2 plan
  const globalFlags = (typeof window !== 'undefined' && (window as any).__FEATURE_FLAGS__) || {}

  return {
    'metrics-collection': globalFlags['metrics-collection'] ?? (import.meta.env.VITE_FEATURE_METRICS === 'true'),
    'distributed-tracing': globalFlags['distributed-tracing'] ?? (import.meta.env.VITE_FEATURE_TRACING === 'true'),
    'srs-v2-algorithm': globalFlags['srs-v2-algorithm'] ?? false,
    'graceful-degradation': globalFlags['graceful-degradation'] ?? false
  }
}

export function isFeatureEnabled(flagName: string, _userId?: string): boolean {
  const flags = getClientFlags()
  return Boolean(flags[flagName])
}

export default { getClientFlags, isFeatureEnabled }
