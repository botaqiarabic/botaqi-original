type TelemetryPayload = Record<string, unknown>

export const telemetry = {
  emit(eventName: string, payload: TelemetryPayload = {}) {
    try {
      // Lightweight client-side telemetry: log and POST to server endpoint if available
      // Keep payload small and JSON-serializable
      // Do not throw on failures
      // eslint-disable-next-line no-console
      console.debug('[telemetry]', eventName, payload)

      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        // Fire-and-forget
        void window.fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventName, payload, ts: new Date().toISOString() })
        }).catch(() => {
          // swallow errors
        })
      }
    } catch (err) {
      // never blow up UI due to telemetry
    }
  }
}

export default telemetry
