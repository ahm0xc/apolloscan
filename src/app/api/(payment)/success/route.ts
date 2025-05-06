import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { kv } from "~/lib/kv";

import { syncStripeDataToKV } from "../utils";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const stripeCustomerId = (await kv.get(`stripe:user:${userId}`)) as
    | string
    | null;

  if (!stripeCustomerId) {
    return redirect("/");
  }

  await syncStripeDataToKV(stripeCustomerId);
  return redirect("/");
}
