import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';
import { configureApp } from './createApp.js';
import { readConfig } from './config.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

const { secretKey, clientUrl } = readConfig(process.env);
const stripe = new Stripe(secretKey, { maxNetworkRetries: 1, timeout: 20000 });
const app = express();
configureApp(app, stripe.checkout.sessions, clientUrl);

export default app;
