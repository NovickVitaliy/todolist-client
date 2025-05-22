import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Provider} from "react-redux";
import {store} from "./store/store.ts";

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const provider = new WebTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'react-frontend', // 🔥 this must be set
    }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(
    new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces', // SigNoz OTLP endpoint
    })
));

provider.register({
    contextManager: new ZoneContextManager()
});

registerInstrumentations({
    instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: [/localhost:8090/], // your API URL
        })
    ]
});

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
