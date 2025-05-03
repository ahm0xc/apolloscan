"use server";

import { unstable_cache } from "next/cache";

import { kv } from "~/lib/kv";
import { Fact, factSchema } from "~/lib/validations";

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
