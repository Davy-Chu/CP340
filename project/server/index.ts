import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createApp } from './createApp.js';
import { readConfig } from './config.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const { secretKey, clientUrl } = readConfig(process.env);
const stripe = new Stripe(secretKey, { maxNetworkRetries: 1, timeout: 20000 });
const app = createApp(stripe.checkout.sessions, clientUrl);

export default app;
