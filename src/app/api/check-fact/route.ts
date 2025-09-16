import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { nanoid } from "nanoid";
import { fetchTranscript } from "youtube-transcript-plus";
import Innertube from "youtubei.js";
import { z } from "zod";

import { checkSubscription } from "~/actions/server-actions";
import { kv } from "~/lib/kv";
import { extractYouTubeVideoId, isYoutubeVideoUrl } from "~/lib/utils";
import { Fact, factSchema } from "~/lib/validations";

export const maxDuration = 60;

async function getTranscript(
  idOrURL: string,
  { transcriptJoin }: { transcriptJoin: string } = { transcriptJoin: " " }
) {
  try {
    const transcript = await fetchTranscript(idOrURL);
    return {
      transcript: transcript.map(({ text }) => text).join(transcriptJoin),
    };
  } catch {
    try {
      const videoId = extractYouTubeVideoId(idOrURL) ?? "";
      const youtube = await Innertube.create({
        lang: "en",
        location: "US",
        retrieve_player: false,
      });
      const info = await youtube.getInfo(videoId);
      const transcriptData = await info.getTranscript();
      const segments =
        transcriptData?.transcript?.content?.body?.initial_segments;
      const transcript = Array.isArray(segments)
        ? segments
            .filter(
              (segment) =>
                segment &&
                segment.snippet &&
                typeof segment.snippet.text === "string"
            )
            .map((segment) => ({
              text: segment.snippet.text,
            }))
        : [];
      if (transcript.length === 0) {
        return {
          error: "No transcript found",
        };
      }
      const plainTranscript = transcript
        .map(({ text }) => text)
        .join(transcriptJoin);
      if (plainTranscript.trim().length === 0) {
        throw new Error("Transcript is empty");
      }

      return {
        transcript: plainTranscript,
      };
    } catch {
      throw new Error("No transcript found");
    }
  }
}

async function getVideoDetails(id: string) {
  const videoDetailsRes = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
  );
  const videoDetails = await videoDetailsRes.json();

  return videoDetails as {
    title: string;
    author_name: string;
    thumbnail_url: string;
  };
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Video URL is required" },
      { status: 400 }
    );
  }

  if (!isYoutubeVideoUrl(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const t1 = performance.now();

  const { isSubscribed } = await checkSubscription(userId);

  if (!isSubscribed) {
    const factCount = (await kv.get(`user:${userId}:factCount`)) ?? "0";
    const lastFactCheck = (await kv.get(`user:${userId}:lastFactCheck`)) ?? "";
    const lastFactCheckDate = lastFactCheck
      ? new Date(lastFactCheck as string)
      : new Date();
    const daysSinceLastFactCheck = Math.floor(
      (new Date().getTime() - lastFactCheckDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const factCountNum = parseInt(factCount as string);

    if (factCountNum > 10) {
      if (daysSinceLastFactCheck < 1) {
        return NextResponse.json(
          {
            error:
              "You have exceeded your free fact checks. You can perform 1 fact check per day. Please try again tomorrow.",
            isSubscriptionRequired: true,
          },
          { status: 400 }
        );
      }
    }
  }

  const factId = nanoid();

  const videoId = extractYouTubeVideoId(url) ?? "";
  console.time("getTranscript");
  const { transcript } = await getTranscript(url, { transcriptJoin: "\n" });
  console.timeEnd("getTranscript");
  // if (transcript.error || !transcript.data) {
  //   return NextResponse.json({ error: transcript.error }, { status: 400 });
  // }
  console.time("getVideoDetails");
  const videoDetails = await getVideoDetails(videoId);
  console.timeEnd("getVideoDetails");

  const p1 = `You are a claim/fact extractor.
   You have to extract all the claims/fact that the video made from the given youtube video details and transcript.
   EXTRACT AS MANY CLAIMS AS POSSIBLE.
   
   <videoDetails>
    <title>${videoDetails.title}</title>
    <author>${videoDetails.author_name}</author>
    <thumbnail>${videoDetails.thumbnail_url}</thumbnail>
    <videoId>${videoId}</videoId>
    <url>${url}</url>
   </videoDetails>
   <videoTranscript>
    ${transcript}
   </videoTranscript>
   `;

  console.time("generateObject p1");
  const { object: claims } = await generateObject({
    model: google("gemini-1.5-flash-latest"),
    schema: z.array(z.string()),
    prompt: p1,
  });
  console.timeEnd("generateObject p1");

  const p2 = `You are a expert fact checker.
   You have to check the truthfulness of the claims/fact (of a video) are listed below.
   And give me the score (1-100) based on its trueness.
   Be very accurate and precise with the score.
   please use latest information and data to check the truthfulness of the claims/fact.

   <VideoDetails>
   <title>${videoDetails.title}</title>
   <author>${videoDetails.author_name}</author>
   </VideoDetails>

   <claims>
    ${claims.map((claim) => `- ${claim}`).join("\n")}
   </claims>
   `;

  console.time("generateObject p2");
  const { object: aiResponse } = await generateObject({
    model: google("gemini-2.0-flash"),
    // model: xai("grok-3-mini"),
    providerOptions: {
      xai: {
        reasoningEffort: "low",
        searchParameters: {
          mode: "on", // 'auto', 'on', or 'off'
          returnCitations: true,
          maxSearchResults: 5,
        },
      },
    },
    schema: factSchema.omit({
      id: true,
      createdAt: true,
      videoDetails: true,
    }),
    prompt: p2,
  });
  console.timeEnd("generateObject p2");

  const fact: Fact = {
    id: factId,
    videoDetails: {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnail_url,
      videoId,
      url,
    },
    ...aiResponse,
    createdAt: new Date().toISOString(),
  };

  console.log(fact);

  factSchema.parse(fact);

  await kv.set(`fact:${userId}:${factId}`, JSON.stringify(fact));
  await kv.increment(`user:${userId}:factCount`);
  await kv.set(`user:${userId}:lastFactCheck`, new Date().toISOString());

  revalidateTag("facts");

  const t2 = performance.now();

  console.log(`fact check time: ${t2 - t1} milliseconds`);

  return NextResponse.json(fact);
}
