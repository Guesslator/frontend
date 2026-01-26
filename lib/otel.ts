import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';

export function initializeOtel() {
    if (typeof window === 'undefined') return;

    const endpoint = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT;
    if (!endpoint) {
        console.warn('OpenTelemetry Endpoint not configured. Tracing disabled.');
        return;
    }

    const exporter = new OTLPTraceExporter({
        url: endpoint,
        headers: parseHeaders(process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS),
    });

    const provider = new WebTracerProvider();

    (provider as any).addSpanProcessor(new BatchSpanProcessor(exporter));

    provider.register({
        contextManager: new ZoneContextManager(),
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // Create a regex from the API URL to allow trace propagation
    const apiRegex = new RegExp(apiUrl.replace(/^https?:\/\//, '').split('/')[0]);

    registerInstrumentations({
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new FetchInstrumentation({
                propagateTraceHeaderCorsUrls: [
                    /localhost:3000/,
                    /127\.0\.0\.1:3000/,
                    apiRegex
                ],
            }),
        ],
    });


}

function parseHeaders(headersString?: string): Record<string, string> {
    if (!headersString) return {};
    const headers: Record<string, string> = {};
    headersString.split(',').forEach((header) => {
        const [key, value] = header.split('=');
        if (key && value) {
            headers[key.trim()] = value.trim();
        }
    });
    return headers;
}
