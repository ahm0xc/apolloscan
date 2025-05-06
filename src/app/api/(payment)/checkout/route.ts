import { NextRequest, NextResponse } from "next/server";

import { auth, createClerkClient } from "@clerk/nextjs/server";

import { kv } from "~/lib/kv";
import { stripe } from "~/lib/stripe";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const priceId = searchParams.get("priceId");

  if (!priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);

  let stripeCustomerId: string | null = (await kv.get(
    `stripe:user:${userId}`
  )) as string | null;

  if (!stripeCustomerId) {
    const newCustomer = await stripe.customers.create({
      email:
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses[0]?.emailAddress,
    });

    await kv.set(`stripe:user:${userId}`, newCustomer.id);
    stripeCustomerId = newCustomer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    // TODO: Add success and cancel URLs
    metadata: {
      userId,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thanks`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
