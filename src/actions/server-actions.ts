"use server";

import { YoutubeTranscript } from 'youtube-transcript';
import * as z from "zod";
import { isYoutubeVideoUrl } from "~/lib/utils";

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

    const transcript = await YoutubeTranscript.fetchTranscript(payload.url);
    const plainTranscript = transcript.map(({ text }) => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }).join(" ");

    console.log("🚀 ~ checkFact ~ transcript:", plainTranscript)
}