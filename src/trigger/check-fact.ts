import { google } from "@ai-sdk/google";
import { task } from "@trigger.dev/sdk/v3";
import { generateObject } from "ai";
import { nanoid } from "nanoid";
import { YouTubeTranscriptApi } from "youtube-transcript-ts";

import { kv } from "~/lib/kv";
import { extractYouTubeVideoId } from "~/lib/utils";
import { factSchema } from "~/lib/validations";

export const checkFactTask = task({
  id: "check-fact",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: { url: string; userId: string }) => {
    const factId = nanoid();

    const api = new YouTubeTranscriptApi();

    const videoId = extractYouTubeVideoId(payload.url);

    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    const videoDetails = await api.fetchTranscript(videoId);
    console.log("got video details");

    const transcript = videoDetails.transcript.snippets
      .map(({ text }) => text)
      .join(" ")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");

    const prompt = `I'm giving you a video. you have to check the truthfulness of the video from the web and give it a score between 1 to 100.
      and extract claims that the video made and give it score (1-100) based on its trueness.
      also return the sources used to check the truthfulness of the video.
      
      <video>
         <title>${videoDetails.metadata.title}</title>
         <author>${videoDetails.metadata.author}</author>
         <transcript>${transcript}</transcript>
      </video>
      `;

    const { object: aiResponse } = await generateObject({
      model: google("gemini-2.5-pro-exp-03-25", {
        useSearchGrounding: true,
      }),
      schema: factSchema.omit({
        id: true,
        createdAt: true,
        videoDetails: true,
      }),
      prompt,
      maxRetries: 2,
    });

    console.log("got ai response");

    const fact = {
      id: factId,
      createdAt: new Date().toISOString(),
      videoDetails: {
        title: videoDetails.metadata.title,
        author: videoDetails.metadata.author,
        thumbnail:
          videoDetails.metadata.thumbnails?.[
            videoDetails.metadata.thumbnails?.length - 1
          ]?.url,
        videoId,
        url: payload.url,
      },
      ...aiResponse,
    };

    const parsedFact = factSchema.parse(fact);
    console.log("parsed fact");

    await kv.set(
      `fact:${payload.userId}:${factId}`,
      JSON.stringify(parsedFact)
    );

    console.log("set fact in kv");

    return parsedFact;
  },
});
