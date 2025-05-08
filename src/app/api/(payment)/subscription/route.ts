import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { checkSubscription } from "~/actions/server-actions";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ status: "none" }, { status: 401 });
  }

  try {
    const { subscription } = await checkSubscription(userId);

    if (!subscription) {
      return NextResponse.json({ status: "none" });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}
