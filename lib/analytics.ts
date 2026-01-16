export async function trackEvent(eventType: string, data: any = {}) {
    try {
        // 1. Send to Backend (Product Analytics)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        // Fire and forget - don't await blocking UI
        fetch(`${apiUrl}/analytics/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType,
                ...data,
            }),
        }).catch(err => console.error('Failed to send analytics event', err));

        // 2. Custom Logic (e.g. console in dev)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${eventType}`, data);
        }
    } catch (error) {
        console.error('Analytics Error', error);
    }
}
