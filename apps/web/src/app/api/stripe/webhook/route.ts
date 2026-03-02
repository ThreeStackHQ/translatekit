import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, subscriptions } from "@translatekit/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        const plan = session.metadata?.plan as "starter" | "pro" | undefined;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!workspaceId || !plan) break;

        const existing = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.workspaceId, workspaceId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(subscriptions)
            .set({
              tier: plan,
              status: "active",
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            })
            .where(eq(subscriptions.workspaceId, workspaceId));
        } else {
          await db.insert(subscriptions).values({
            workspaceId,
            tier: plan,
            status: "active",
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId;
        if (!workspaceId) break;

        const priceId = sub.items.data[0]?.price?.id;
        const tier = priceId?.includes("starter") ? "starter" : priceId?.includes("pro") ? "pro" : "free";

        await db
          .update(subscriptions)
          .set({
            status: sub.status === "active" ? "active" : "inactive",
            tier,
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          })
          .where(eq(subscriptions.workspaceId, workspaceId));
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId;
        if (!workspaceId) break;

        await db
          .update(subscriptions)
          .set({ status: "cancelled", tier: "free" })
          .where(eq(subscriptions.workspaceId, workspaceId));
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Note: Next.js App Router route handlers receive the raw body via req.text()
// No need for bodyParser: false configuration
