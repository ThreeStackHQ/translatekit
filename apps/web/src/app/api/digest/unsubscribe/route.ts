import { NextRequest, NextResponse } from "next/server";
import { db, subscriptions } from "@translatekit/db";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const [sub] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.unsubscribeToken, token))
      .limit(1);

    if (!sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    await db
      .update(subscriptions)
      .set({ digestOptOut: true })
      .where(eq(subscriptions.id, sub.id));

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Unsubscribed</title></head>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px">
  <div style="max-width:400px;margin:0 auto">
    <div style="font-size:48px;margin-bottom:16px">✅</div>
    <h1 style="color:#1f2937">Unsubscribed</h1>
    <p style="color:#6b7280">You've been unsubscribed from the weekly translation digest.</p>
    <a href="https://translatekit.threestack.io/dashboard" 
       style="display:inline-block;margin-top:20px;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
      Back to Dashboard
    </a>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("[unsubscribe] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
