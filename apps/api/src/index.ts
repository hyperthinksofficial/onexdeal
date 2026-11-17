import { createApp } from './app.js';
import { loadApiEnv } from './config/env.js';

const env = loadApiEnv();
const app = createApp();

app.listen(env.PORT, () => {
  console.warn(
    JSON.stringify({
      level: 'info',
      service: 'onexdeal-api',
      environment: env.NODE_ENV,
      port: env.PORT,
      message: 'OneXDeal API server listening',
    }),
  );
});
