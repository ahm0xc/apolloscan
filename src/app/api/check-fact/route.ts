import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { tryCatch } from "@ahm0xc/utils";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { Output, generateText } from "ai";
import { nanoid } from "nanoid";
import { YoutubeTranscript } from "youtube-transcript";
import { fetchTranscript } from "youtube-transcript-plus";
import { Innertube } from "youtubei.js";
import { z } from "zod";

import { checkSubscription } from "~/actions/server-actions";
import { kv } from "~/lib/kv";
import { extractYouTubeVideoId, isYoutubeVideoUrl } from "~/lib/utils";
import { Fact, factSchema } from "~/lib/validations";

export const maxDuration = 300;

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

  const t1 = performance.now();

  const videoId = extractYouTubeVideoId(url) ?? "";

  if (!videoId) {
    return NextResponse.json(
      { error: "Failed to get video Id" },
      { status: 400 }
    );
  }

  const { error: transcriptError, transcript } = await getTranscript(url, {
    transcriptJoin: "\n",
  });

  if (transcriptError || !transcript) {
    return NextResponse.json(
      { error: transcriptError ?? "Failed to get transcript" },
      { status: 400 }
    );
  }
  const videoDetails = await getVideoDetails(videoId);

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

  const { output: claims } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    output: Output.object({
      schema: z.array(z.string()),
    }),
    prompt: p1,
  });

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

  const { output: aiResponse } = await generateText({
    model: google("gemini-2.5-flash"),
    output: Output.object({
      schema: factSchema.omit({
        id: true,
        createdAt: true,
        videoDetails: true,
      }),
    }),
    prompt: p2,
  });

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

  factSchema.parse(fact);

  await kv.set(`fact:${userId}:${factId}`, JSON.stringify(fact));
  await kv.increment(`user:${userId}:factCount`);
  await kv.set(`user:${userId}:lastFactCheck`, new Date().toISOString());

  const t2 = performance.now();

  console.log(`Total time ${Math.round((t2 - t1) / 1000)}s`);

  revalidateTag("facts");

  return NextResponse.json(fact);
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

async function getTranscript(
  videoId: string,
  { transcriptJoin }: { transcriptJoin: string } = { transcriptJoin: " " }
) {
  const [t1, t1Error] = await tryCatch(fetchTranscript(videoId));

  if (!t1Error && t1) {
    console.log("🟡 transcript from t1");
    return {
      transcript: t1.map(({ text }) => text).join(transcriptJoin),
    };
  }

  const [t2, t2Error] = await tryCatch(
    YoutubeTranscript.fetchTranscript(videoId)
  );

  if (!t2Error && t2) {
    console.log("🟡 transcript from t2");
    return {
      transcript: t2.map(({ text }) => text).join(transcriptJoin),
    };
  }

  async function innnerTubeTranscription(videoId: string) {
    const youtube = await Innertube.create();
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    const transcript =
      transcriptData.transcript.content?.body?.initial_segments.map(
        (segment) => {
          return {
            text: segment.snippet.text,
          };
        }
      );

    return transcript?.join(transcriptJoin);
  }

  const [t3, t3Error] = await tryCatch(innnerTubeTranscription(videoId));

  if (!t3Error && t3) {
    console.log("🟡 transcript from t3");
    return {
      transcript: t3,
    };
  }

  return {
    transcript: null,
    error: "You couldn't find any transcript for this video.",
  };
}
