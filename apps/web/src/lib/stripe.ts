import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(stripeSecretKey ?? "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "price_starter",
    name: "Starter",
    amount: 900, // $9.00
    tier: "starter" as const,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro",
    name: "Pro",
    amount: 2900, // $29.00
    tier: "pro" as const,
  },
} as const;
