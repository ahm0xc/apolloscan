import { z } from "zod";

export const factSchema = z.object({
  id: z.string(),
  score: z
    .number()
    .min(1)
    .max(100)
    .describe("Overall Truthfulness score for the video"),
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
        claim: z.string().describe("Claim/fact made by the video"),
        score: z
          .number()
          .min(1)
          .max(100)
          .describe("Individual Truthfulness score for the claim/fact"),
        sources: z
          .array(z.string())
          .describe(
            "Links of the sources used to validate the claim/fact. Only give working links. Always give links to the original source (URLs)"
          ),
      })
    )
    .min(1)
    .describe(
      "Claims made by the video, please claims as many as possible from the video."
    ),
  summary: z.string().describe("An analytical summary of the video"),
  // sources: z
  //   .array(z.string())
  //   .describe(
  //     "Links of the sources used by the video. Only give working links. Always give links to the original source (URLs). add as many links as possible."
  //   ),
  createdAt: z.string(),
});

export type Fact = z.infer<typeof factSchema>;
