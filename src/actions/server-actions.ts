"use server";

import { YoutubeTranscript } from 'youtube-transcript';
import * as z from "zod";
import { extractYouTubeVideoId, isYoutubeVideoUrl } from "~/lib/utils";

const CheckFactPayloadSchema = z.object({
    url: z.string().url().refine(
        (url) => isYoutubeVideoUrl(url),
        { message: "URL must be a valid YouTube video URL" }
    ),
})

export async function checkFact(payload: z.infer<typeof CheckFactPayloadSchema>) {
    const result = CheckFactPayloadSchema.safeParse(payload);
    if (!result.success) {
        return {
            error: result.error.errors[0]?.message,
        }
    }
    payload = result.data;

    const videoId = extractYouTubeVideoId(payload.url);

    if (!videoId) {
        return {
            error: "Invalid YouTube video URL",
        }
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const plainTranscript = transcript.map(({ text }) => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }).join(" ");

    const videoDetailsRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    const videoDetails = await videoDetailsRes.json();
    console.log("🚀 ~ checkFact ~ videoDetails:", videoDetails)
}