"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";

// Define the subscription data type based on what's stored in KV
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

// Default state for when we don't have data yet
const defaultSubscriptionData: SubscriptionData = {
  status: "none",
  priceId: null,
  currentPeriodEnd: null,
  currentPeriodStart: null,
  cancelAtPeriodEnd: false,
  paymentMethod: null,
};

// Function to open the Stripe billing portal
export async function openBillingPortal() {
  try {
    const response = await fetch("/api/billing-portal");
    if (!response.ok) {
      throw new Error(`Failed to open billing portal: ${response.statusText}`);
    }

    const { url } = await response.json();

    // Redirect to the Stripe billing portal
    window.location.href = url;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error opening billing portal:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to open billing portal",
    };
  }
}

export function useSubscription() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>(
    defaultSubscriptionData
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if auth hasn't loaded or user isn't signed in
    if (!isLoaded || !isSignedIn || !userId) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the subscription data from the API
        const response = await fetch(`/api/subscription`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch subscription: ${response.statusText}`
          );
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch subscription data"
        );
        // Keep the default subscription data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId, isSignedIn, isLoaded]);

  // Helper function to check if user has active subscription
  const isSubscribed =
    subscription.status === "active" || subscription.status === "trialing";

  // Add a method to open the billing portal directly from the hook
  const manageBilling = async () => {
    return openBillingPortal();
  };

  return {
    subscription,
    isLoading,
    error,
    isSubscribed,
    manageBilling,
  };
}

export default useSubscription;
