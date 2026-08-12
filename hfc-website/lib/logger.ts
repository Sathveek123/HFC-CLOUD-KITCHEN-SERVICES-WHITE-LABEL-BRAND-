import * as Sentry from '@sentry/nextjs'

/**
 * Error Monitoring & Alerting Utility
 * Actively dispatches errors to Sentry monitoring & log streams.
 */
export function captureError(error: any, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const errorPayload = {
    message: typeof error === 'string' ? error : error?.message || 'Unknown runtime error',
    stack: error?.stack || null,
    context: context || {},
    timestamp,
  }

  console.error('[HFC MONITORING ALERT]', errorPayload)

  // Actively send exception to Sentry
  try {
    Sentry.captureException(error, { extra: context })
  } catch (e) {
    // Sentry capture fallback
  }
}

/**
 * Report network sync failure
 */
export function reportSyncFailure(orderId: string, error: any) {
  captureError(error, { orderId, event: 'supabase_sync_failure' })
}
