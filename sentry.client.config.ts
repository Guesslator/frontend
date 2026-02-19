import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    enabled: process.env.NODE_ENV === 'production',

    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Session Replay (optional, free tier limited)
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Filter out network errors from health checks
      if (event.request?.url?.includes('/health')) {
        return null;
      }

      // Filter out known browser extension errors
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('extension')
      ) {
        return null;
      }

      return event;
    },

    // Add user context automatically
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'ui.click') {
        const target = hint?.event?.target;
        if (target && 'tagName' in target && target.tagName === 'BUTTON') {
          breadcrumb.message = `Button clicked: ${target.textContent || 'Unknown'}`;
        }
      }
      return breadcrumb;
    },
  });
} else {
  console.warn('[Sentry] Client DSN not configured');
}
