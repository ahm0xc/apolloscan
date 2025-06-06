import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { nanoid } from "nanoid";
import Innertube from "youtubei.js";

import { checkSubscription } from "~/actions/server-actions";
import { kv } from "~/lib/kv";
import { extractYouTubeVideoId, isYoutubeVideoUrl } from "~/lib/utils";
import { factSchema } from "~/lib/validations";

export const maxDuration = 60;

async function getTranscript(id: string) {
  const youtube = await Innertube.create({
    lang: "en",
    location: "US",
    retrieve_player: false,
  });
  const info = await youtube.getInfo(id);
  const transcriptData = await info.getTranscript();
  const segments = transcriptData?.transcript?.content?.body?.initial_segments;
  const transcript = Array.isArray(segments)
    ? segments
        .filter(
          (segment: any) =>
            segment &&
            segment.snippet &&
            typeof segment.snippet.text === "string"
        )
        .map((segment: any) => ({
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
    .join(" ")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  if (plainTranscript.trim().length === 0) {
    return {
      error: "Transcript is empty",
    };
  }

  return {
    data: plainTranscript,
  };
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
  // const transcript = await getTranscript(videoId);
  // if (transcript.error || !transcript.data) {
  //   return NextResponse.json({ error: transcript.error }, { status: 400 });
  // }
  const videoDetails = await getVideoDetails(videoId);

  const prompt = `I'm giving you a video. you have to check the truthfulness of the video from the web and give it a score between 1 to 100.
         and extract claims that the video made and give it score (1-100) based on its trueness.
         also return the sources used to check the truthfulness of the video. Give me as many sources as possible. also provide as accurate claims that the video made.
         
         <video>
            <title>${videoDetails.title}</title>
            <author>${videoDetails.author_name}</author>
            <url>${url}</url>
         </video>
         `;

  const { object: aiResponse } = await generateObject({
    model: google("gemini-2.5-flash-preview-04-17", {
      useSearchGrounding: true,
      // cachedContent: videoId,
    }),
    schema: factSchema.omit({
      id: true,
      createdAt: true,
      videoDetails: true,
    }),
    prompt,
    maxRetries: 2,
  });

  const fact = {
    id: factId,
    createdAt: new Date().toISOString(),
    videoDetails: {
      title: videoDetails.title,
      author: videoDetails.author_name,
      thumbnail: videoDetails.thumbnail_url,
      videoId,
      url,
    },
    ...aiResponse,
  };

  await kv.set(`fact:${userId}:${factId}`, JSON.stringify(fact));
  await kv.increment(`user:${userId}:factCount`);
  await kv.set(`user:${userId}:lastFactCheck`, new Date().toISOString());

  revalidateTag("facts");

  const t2 = performance.now();

  console.log(`fact check time: ${t2 - t1} milliseconds`);

  return NextResponse.json(fact);
}
