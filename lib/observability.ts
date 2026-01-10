import * as Sentry from '@sentry/nextjs';

// User context management
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

// Manually capture errors
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
    tags: context ? {
      page: context.page,
      action: context.action,
    } : undefined,
  });
}

// Capture specific messages
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}

// Add breadcrumb for user actions
export function trackAction(action: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data,
  });
}

// Performance tracking
export function trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
  if (duration > 2000) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Slow operation: ${operation} took ${duration}ms`,
      level: 'warning',
      data: {
        ...metadata,
        duration,
      },
    });
  }

  // Send to Sentry if very slow
  if (duration > 5000) {
    Sentry.captureMessage(`Very slow operation: ${operation}`, {
      level: 'warning',
      tags: {
        operation,
        performance: 'slow',
      },
      contexts: {
        performance: {
          operation,
          duration,
          ...metadata,
        },
      },
    });
  }
}

// API error tracking
export function trackAPIError(
  endpoint: string,
  method: string,
  statusCode: number,
  error?: Error,
  context?: Record<string, any>
) {
  const message = `API Error: ${method} ${endpoint} - ${statusCode}`;

  Sentry.addBreadcrumb({
    category: 'api',
    message,
    level: statusCode >= 500 ? 'error' : 'warning',
    data: {
      endpoint,
      method,
      statusCode,
      ...context,
    },
  });

  // Capture errors for 5xx responses
  if (statusCode >= 500) {
    if (error) {
      Sentry.captureException(error, {
        tags: {
          endpoint,
          method,
          statusCode: statusCode.toString(),
        },
        contexts: {
          api: {
            endpoint,
            method,
            statusCode,
            ...context,
          },
        },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: {
          endpoint,
          method,
          statusCode: statusCode.toString(),
        },
      });
    }
  }
}

// Quiz-specific tracking
export function trackQuizEvent(event: string, quizId?: string, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'quiz',
    message: event,
    level: 'info',
    data: {
      quizId,
      ...metadata,
    },
  });
}

// Image upload tracking
export function trackImageUpload(status: 'started' | 'success' | 'failed' | 'rejected', metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'image-upload',
    message: `Image upload ${status}`,
    level: status === 'failed' || status === 'rejected' ? 'error' : 'info',
    data: metadata,
  });

  // Send moderation rejections to Sentry
  if (status === 'rejected') {
    Sentry.captureMessage('Image moderation rejected', {
      level: 'warning',
      tags: {
        imageUpload: 'rejected',
      },
      contexts: {
        moderation: metadata,
      },
    });
  }
}

// Wrap async operations with performance tracking
export async function withPerformanceTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, metadata);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    trackPerformance(operation, duration, { ...metadata, error: true });
    throw error;
  }
}
