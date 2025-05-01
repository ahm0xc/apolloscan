import { z } from "zod";

export const factSchema = z.object({
  id: z.string(),
  score: z
    .number()
    .min(1)
    .max(100)
    .describe("Truthfulness score for the video"),
  videoDetails: z.object({
    title: z.string(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    videoId: z.string(),
    url: z.string().url(),
  }),
  claims: z
    .array(
      z.object({
        claim: z.string().describe("Claim made by the video"),
        score: z
          .number()
          .min(1)
          .max(100)
          .describe("Individual Truthfulness score for the claim"),
      })
    )
    .min(1)
    .max(20)
    .describe("Claims made by the video"),
  summary: z.string().max(1000).describe("Summary of the video"),
  sources: z
    .array(z.string())
    .describe("Links of the sources used by the video. Only give working links."),
  createdAt: z.string(),
});

export type Fact = z.infer<typeof factSchema>;
