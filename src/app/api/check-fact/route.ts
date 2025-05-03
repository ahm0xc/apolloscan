import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { nanoid } from "nanoid";
import Innertube from "youtubei.js";

import { kv } from "~/lib/kv";
import { extractYouTubeVideoId, isYoutubeVideoUrl } from "~/lib/utils";
import { factSchema } from "~/lib/validations";

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

  const factId = nanoid();

  const videoId = extractYouTubeVideoId(url) ?? "";
  const transcript = await getTranscript(videoId);
  if (transcript.error || !transcript.data) {
    return NextResponse.json({ error: transcript.error }, { status: 400 });
  }
  const videoDetails = await getVideoDetails(videoId);

  const prompt = `I'm giving you a video. you have to check the truthfulness of the video from the web and give it a score between 1 to 100.
         and extract claims that the video made and give it score (1-100) based on its trueness.
         also return the sources used to check the truthfulness of the video.
         
         <video>
            <title>${videoDetails.title}</title>
            <author>${videoDetails.author_name}</author>
            <transcript>${transcript.data}</transcript>
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

  revalidateTag("facts");

  return NextResponse.json(fact);
}

// import { NextRequest, NextResponse } from "next/server";

// import { auth } from "@clerk/nextjs/server";

// import { extractYouTubeVideoId } from "~/lib/utils";
// import { checkFactTask } from "~/trigger/check-fact";

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const url = searchParams.get("url");

//   if (!url) {
//     return NextResponse.json(
//       { error: "Video URL is required" },
//       { status: 400 }
//     );
//   }

//   const { userId } = await auth();

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const videoId = extractYouTubeVideoId(url);

//   if (!videoId) {
//     return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
//   }

//   try {
//     const handle = await checkFactTask.trigger({
//       url,
//       userId,
//     });

//     return NextResponse.json(handle);
//   } catch (error) {
//     console.error("Error triggering check-fact task:", error);
//     return NextResponse.json(
//       { error: "Failed to check fact" },
//       { status: 500 }
//     );
//   }
// }
