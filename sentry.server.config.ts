import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Server-side filtering
    beforeSend(event, hint) {
      // Don't send health check errors
      if (event.request?.url?.includes('/health') || event.request?.url?.includes('/api/health')) {
        return null;
      }

      // Filter out specific known errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'code' in error) {
        // Filter out specific error codes if needed
        if (error.code === 'ECONNREFUSED' && event.request?.url?.includes('localhost')) {
          return null; // Development connection errors
        }
      }

      return event;
    },
  });

  console.log(`[Sentry] Server initialized in ${SENTRY_ENVIRONMENT} environment`);
} else {
  console.warn('[Sentry] Server DSN not configured');
}
