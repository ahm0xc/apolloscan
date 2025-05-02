import { NextRequest, NextResponse } from "next/server";

import { YouTubeTranscriptApi } from "youtube-transcript-ts";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    const api = new YouTubeTranscriptApi();

    const response = await api.fetchTranscript(videoId);

    return NextResponse.json(response.transcript.snippets);
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript" },
      { status: 500 }
    );
  }
}
