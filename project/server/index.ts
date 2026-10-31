import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createApp } from './app.js';
import { readConfig } from './config.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

try {
  const { secretKey, clientUrl, port } = readConfig(process.env);
  const stripe = new Stripe(secretKey, { maxNetworkRetries: 1, timeout: 20000 });
  const app = createApp(stripe.checkout.sessions, clientUrl);
  app.listen(port, () => {
    console.log(`WorkNest sandbox checkout server: http://localhost:${port}`);
  }).on('error', (error) => {
    console.error('Could not start the checkout server:', error.message);
    process.exitCode = 1;
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Could not configure checkout.');
  process.exitCode = 1;
}
