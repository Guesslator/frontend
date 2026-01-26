import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Edge runtime has lower limits
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.05'),

    beforeSend(event) {
      // Filter middleware errors if needed
      if (event.request?.url?.includes('/_next/')) {
        return null;
      }
      return event;
    },
  });


} else {
  console.warn('[Sentry] Edge DSN not configured');
}
