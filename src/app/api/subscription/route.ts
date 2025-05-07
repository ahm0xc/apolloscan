import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { kv } from "~/lib/kv";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: "none" }, { status: 401 });
  }

  try {
    // First, get the Stripe customer ID for this user
    const stripeCustomerId = (await kv.get(`stripe:user:${userId}`)) as
      | string
      | null;

    if (!stripeCustomerId) {
      // If no customer ID, they don't have a subscription
      return NextResponse.json({ status: "none" });
    }

    // Get the subscription data from KV
    const subscriptionData = await kv.get(
      `stripe:customer:${stripeCustomerId}`
    );

    if (!subscriptionData) {
      // If no subscription data, they don't have a subscription
      return NextResponse.json({ status: "none" });
    }

    // If it's a string (JSON), parse it
    const parsedData =
      typeof subscriptionData === "string"
        ? JSON.parse(subscriptionData)
        : subscriptionData;

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}
