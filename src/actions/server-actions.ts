"use server";

import { cache } from "react";

import { unstable_cache } from "next/cache";

import { kv } from "~/lib/kv";
import { Fact, factSchema } from "~/lib/validations";

export interface SubscriptionData {
  subscriptionId?: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid"
    | "none";
  priceId: string | null;
  currentPeriodEnd: number | null;
  currentPeriodStart: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: {
    brand: string | null;
    last4: string | null;
  } | null;
}

export const checkSubscription = cache(
  async (
    userId: string
  ): Promise<{
    isSubscribed: boolean;
    subscription: SubscriptionData | null;
  }> => {
    try {
      const stripeCustomerId = (await kv.get(`stripe:user:${userId}`)) as
        | string
        | null;

      if (!stripeCustomerId) {
        return { isSubscribed: false, subscription: null };
      }

      const subscriptionData = await kv.get(
        `stripe:customer:${stripeCustomerId}`
      );

      if (!subscriptionData) {
        return { isSubscribed: false, subscription: null };
      }

      const parsedData =
        typeof subscriptionData === "string"
          ? JSON.parse(subscriptionData)
          : subscriptionData;

      const isSubscribed =
        parsedData.status === "active" || parsedData.status === "trialing";

      return {
        isSubscribed,
        subscription: parsedData,
      };
    } catch (error) {
      console.error("Error checking subscription:", error);
      return { isSubscribed: false, subscription: null };
    }
  }
);

export const getFacts = unstable_cache(
  async (
    userId: string
  ): Promise<{
    data: Fact[];
    error: string | null;
  }> => {
    try {
      const facts = await kv.getByPattern(`fact:${userId}:*`);
      const parsedFacts = facts.map((fact) => factSchema.parse(fact));
      const sortedFacts = parsedFacts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        data: sortedFacts,
        error: null,
      };
    } catch (error) {
      console.error("🔴 error", error);
      return {
        data: [],
        error: "Failed to get facts",
      };
    }
  },
  ["facts"],
  { tags: ["facts"] }
);
