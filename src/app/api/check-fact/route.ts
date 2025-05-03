import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { extractYouTubeVideoId } from "~/lib/utils";
import { checkFactTask } from "~/trigger/check-fact";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Video URL is required" },
      { status: 400 }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const handle = await checkFactTask.trigger({
      url,
      userId,
    });

    return NextResponse.json(handle);
  } catch (error) {
    console.error("Error triggering check-fact task:", error);
    return NextResponse.json(
      { error: "Failed to check fact" },
      { status: 500 }
    );
  }
}
