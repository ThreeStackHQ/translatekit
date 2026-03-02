import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db, workspaces, subscriptions } from "@translatekit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const userEmail = session.user.email ?? undefined;

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid plan. Choose 'starter' or 'pro'" },
        { status: 400 }
      );
    }

    const { plan } = parsed.data;
    const planConfig = STRIPE_PLANS[plan];

    // Get user's workspace
    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.userId, userId))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    // Get or create Stripe customer
    const [sub] = await db
      .select({ stripeCustomerId: subscriptions.stripeCustomerId })
      .from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspace.id))
      .limit(1);

    let customerId = sub?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { workspaceId: workspace.id, userId },
      });
      customerId = customer.id;
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/dashboard/billing?cancelled=true`,
      metadata: {
        workspaceId: workspace.id,
        userId,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
