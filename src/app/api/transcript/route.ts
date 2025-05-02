import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript-plus";

export async function GET(request: NextRequest) {
    const videoId = request.nextUrl.searchParams.get("videoId");
    if (!videoId) {
        return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    try {
        const transcript = await fetchTranscript(videoId, {
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        });
        return NextResponse.json(transcript);
    } catch (error) {
        console.error("Error fetching transcript:", error);
        return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 });
    }
}