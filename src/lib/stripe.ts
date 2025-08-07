import Stripe from "stripe";

import { kv } from "~/lib/kv";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

export async function syncStripeDataToKV(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
    expand: ["data.default_payment_method"],
  });

  if (subscriptions.data.length === 0) {
    const subData = { status: "none" };
    await kv.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
    return subData;
  }

  // If a user can have multiple subscriptions, that's your problem
  const subscription = subscriptions.data[0];

  if (!subscription) {
    const subData = { status: "none" };
    await kv.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
    return subData;
  }

  // Store complete subscription state
  const subData = {
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price?.id ?? null,
    currentPeriodEnd: subscription.ended_at,
    currentPeriodStart: subscription.start_date,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    paymentMethod:
      subscription.default_payment_method &&
        typeof subscription.default_payment_method !== "string"
        ? {
          brand: subscription.default_payment_method.card?.brand ?? null,
          last4: subscription.default_payment_method.card?.last4 ?? null,
        }
        : null,
  };

  // Store the data in your KV
  await kv.set(`stripe:customer:${customerId}`, JSON.stringify(subData));
  return subData;
}
