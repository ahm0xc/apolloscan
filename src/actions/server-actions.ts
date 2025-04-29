"use server";

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
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

    try {

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

        const prompt = `I'm giving you a video. you have to check the truthfulness of the video from the web and give it a score between 1 to 100.
         and extract claims that the video made and give it score (1-100) based on its trueness.
         also return the sources used to check the truthfulness of the video.
         
         <video>
            <title>${videoDetails.title}</title>
            <author>${videoDetails.author_name}</author>
            <transcript>${plainTranscript}</transcript>
         </video>
         `

        console.log("🟡 prompt", prompt);

        const { object: aiResponse } = await generateObject({
            model: google("gemini-2.5-pro-exp-03-25", {
                useSearchGrounding: true,
            }),
            schema: z.object({
                score: z.number().min(1).max(100).describe("Truthfulness score for the video"),
                claims: z.array(z.object({
                    claim: z.string().describe("Claim made by the video"),
                    score: z.number().min(1).max(100).describe("Individual Truthfulness score for the claim"),
                })).min(1).max(10).describe("Claims made by the video"),
                summary: z.string().max(1000).describe("Summary of the video"),
                sources: z.array(z.string()).min(1).max(10).describe("Source urls used to check the truthfulness of the video"),
            }),
            prompt
        })



        console.log("🟡 aiResponse", aiResponse);

        return {
            data: {
                score: aiResponse.score,
                claims: aiResponse.claims,
                summary: aiResponse.summary,
                sources: aiResponse.sources,
            }
        }

    } catch (error) {
        console.error("🔴 error", error);
        return {
            error: "Failed to check fact",
        }
    }
}