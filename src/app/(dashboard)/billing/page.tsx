"use client";

import React from "react";

import { useRouter } from "next/navigation";

import {
  CheckIcon,
  CreditCardIcon,
  Loader2Icon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";

import useSubscription, { openBillingPortal } from "~/hooks/use-subscription";
import { cn } from "~/lib/utils";

interface Tier {
  name: string;
  id: string;
  priceIds?: {
    monthly: string | undefined;
    yearly: string | undefined;
  };
  price?: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
}

const tiers: Tier[] = [
  {
    name: "Free",
    id: "tier-free",
    description: "Get started free and check the truth of the internet.",
    features: ["1 fact check per day", "History retention", "Limited support"],
    featured: false,
    cta: "Get started for free",
  },
  {
    name: "Pro",
    id: "tier-pro",
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_PRO_PLAN_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_PRO_PLAN_YEARLY_PRICE_ID,
    },
    price: {
      monthly: 6.99,
      yearly: 67.99,
    },
    description:
      "Unlimited fact checks and premium features to help you verify content with confidence.",
    features: [
      "Unlimited Fact Checks",
      "History retention",
      "Priority support",
      "Export reports",
      "Early access to new features",
    ],
    featured: true,
    cta: "Start 3 day free trial",
  },
];

export default function BillingPage() {
  const [frequency, setFrequency] = React.useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const router = useRouter();
  const { isSubscribed } = useSubscription();

  const handleCheckout = async (tier: Tier) => {
    const priceId = tier.priceIds?.[frequency];
    if (!priceId) {
      router.push("/");
      return;
    }

    try {
      setIsLoading(tier.id);
      const res = await fetch(`/api/checkout?priceId=${priceId}`);
      const data = await res.json();

      window.location.href = data.url;
    } catch (error) {
      // TODO: Handle error & add toast
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="mx-auto aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-base/7 font-semibold text-indigo-600">
          Simple Pricing
        </h2>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
          We Encourage Simple Pricing
        </p>
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-600 sm:text-xl/8">
        Get started free or scale with our pro plan. No hidden fees, cancel
        anytime. Our tool lets you know the truth behind the media.
      </p>

      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-md">
          <SubscriptionStatus />
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="relative flex rounded-full bg-gray-100 p-1">
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              frequency === "monthly"
                ? "bg-indigo-500 text-white shadow"
                : "text-gray-500 hover:text-gray-900"
            )}
            onClick={() => setFrequency("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
              frequency === "yearly"
                ? "bg-indigo-500 text-white shadow"
                : "text-gray-500 hover:text-gray-900"
            )}
            onClick={() => setFrequency("yearly")}
          >
            Yearly
            <span className="absolute -right-4 -top-4 flex h-5 w-12 items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-medium text-white">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
        {tiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={cn(
              tier.featured
                ? "relative bg-gray-900 shadow-2xl"
                : "bg-white/60 sm:mx-8 lg:mx-0",
              tier.featured
                ? ""
                : tierIdx === 0
                  ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                  : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
              "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
            )}
          >
            <h3
              id={tier.id}
              className={cn(
                tier.featured ? "text-indigo-400" : "text-indigo-600",
                "text-base/7 font-semibold"
              )}
            >
              {tier.name}
            </h3>
            <p className="mt-4 flex items-baseline gap-x-2">
              <span
                className={cn(
                  tier.featured ? "text-white" : "text-gray-900",
                  "text-5xl font-semibold tracking-tight"
                )}
              >
                ${tier.price?.[frequency] ?? 0}
              </span>
              <span
                className={cn(
                  tier.featured ? "text-gray-400" : "text-gray-500",
                  "text-base"
                )}
              >
                /{frequency === "monthly" ? "month" : "year"}
              </span>
            </p>
            <p
              className={cn(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-6 text-base/7"
              )}
            >
              {tier.description}
            </p>
            <ul
              role="list"
              className={cn(
                tier.featured ? "text-gray-300" : "text-gray-600",
                "mt-8 space-y-3 text-sm/6 sm:mt-10"
              )}
            >
              {tier.features.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      tier.featured ? "text-indigo-400" : "text-indigo-600",
                      "h-6 w-5 flex-none"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(tier)}
              disabled={isLoading === tier.id || isSubscribed}
              className={cn(
                "flex items-center gap-2 disabled:opacity-70",
                tier.featured
                  ? "bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-indigo-500"
                  : "text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-indigo-600",
                "mt-8 flex rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
              )}
            >
              {isLoading === tier.id && (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              )}
              <span>{tier.cta}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionStatus() {
  const { subscription, error, isSubscribed } = useSubscription();
  const [isPortalLoading, setIsPortalLoading] = React.useState(false);

  if (error) {
    return (
      <div className="w-full max-w-full rounded-xl bg-rose-50 p-8 shadow-sm ring-1 ring-rose-200">
        <div className="flex items-center text-rose-500 mb-3">
          <XIcon className="h-6 w-6 mr-2" />
          <h3 className="text-xl font-medium">Error</h3>
        </div>
        <p className="text-rose-700">Error loading subscription: {error}</p>
      </div>
    );
  }

  const handleManageBilling = async () => {
    setIsPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusColors = {
    active: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    trialing: "bg-blue-50 text-blue-700 ring-blue-600/20",
    canceled: "bg-amber-50 text-amber-700 ring-amber-600/20",
    past_due: "bg-rose-50 text-rose-700 ring-rose-600/20",
    incomplete: "bg-gray-50 text-gray-700 ring-gray-600/20",
    incomplete_expired: "bg-gray-50 text-gray-700 ring-gray-600/20",
    unpaid: "bg-rose-50 text-rose-700 ring-rose-600/20",
    none: "bg-gray-50 text-gray-700 ring-gray-600/20",
  };

  const getStatusColor = (status: keyof typeof statusColors) => {
    return statusColors[status] || statusColors.none;
  };

  if (!isSubscribed) return null;

  return (
    <div className="w-full max-w-full rounded-xl bg-gradient-to-tr from-indigo-50 to-white p-8 pb-4 shadow-sm ring-1 ring-indigo-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-2xl font-semibold text-indigo-900">
          Your Subscription
        </h3>
        <div
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset",
            getStatusColor(subscription.status as keyof typeof statusColors)
          )}
        >
          {subscription.status === "active" && "Active"}
          {subscription.status === "trialing" && "Trial"}
          {subscription.status === "canceled" && "Canceled"}
          {subscription.status === "past_due" && "Past Due"}
          {subscription.status === "incomplete" && "Incomplete"}
          {subscription.status === "incomplete_expired" && "Expired"}
          {subscription.status === "unpaid" && "Unpaid"}
          {subscription.status === "none" && "No Subscription"}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {isSubscribed && (
          <>
            <div className="flex items-start">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-base font-medium text-gray-900">
                  {subscription.status === "active"
                    ? "Active Subscription"
                    : "Trial Subscription"}
                </p>
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subscription.cancelAtPeriodEnd
                      ? `Your plan will end on ${formatDate(subscription.currentPeriodEnd)}`
                      : `Your next billing date is ${formatDate(subscription.currentPeriodEnd)}`}
                  </p>
                )}
              </div>
            </div>

            {subscription.paymentMethod && (
              <div className="flex items-start">
                <CreditCardIcon className="h-6 w-6 text-indigo-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium text-gray-900">
                    Payment Method
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {subscription.paymentMethod.brand && (
                      <span className="capitalize">
                        {subscription.paymentMethod.brand}
                      </span>
                    )}{" "}
                    •••• {subscription.paymentMethod.last4}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {!isSubscribed && (
          <div className="flex items-start md:col-span-2">
            <ShieldCheckIcon className="h-6 w-6 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-base font-medium text-gray-900">
                No Active Subscription
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Upgrade to a paid plan to unlock all features and gain unlimited
                access to our service.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-6 border-t border-indigo-100 flex justify-end">
        {isSubscribed ? (
          <button
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {isPortalLoading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                Opening Portal...
              </>
            ) : (
              "Manage Subscription"
            )}
          </button>
        ) : (
          <button
            onClick={handleManageBilling}
            disabled={isPortalLoading}
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {isPortalLoading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Upgrade Plan"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
