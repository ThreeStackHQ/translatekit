import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, users, workspaces, subscriptions } from "@translatekit/db";
import { eq } from "drizzle-orm";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if user already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash })
      .returning();

    // Create default workspace
    const workspaceName = name ?? email.split("@")[0];
    const [workspace] = await db
      .insert(workspaces)
      .values({ userId: user.id, name: `${workspaceName}'s Workspace` })
      .returning();

    // Create free subscription
    await db.insert(subscriptions).values({
      workspaceId: workspace.id,
      tier: "free",
      status: "active",
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[signup] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
