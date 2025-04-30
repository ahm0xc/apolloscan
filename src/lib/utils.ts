import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isYoutubeVideoUrl(url: string): boolean {
  // Patterns for popular video services
  const videoPatterns = [
    // YouTube
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i,
    // Vimeo
    /^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+$/i,
    // Twitch (videos and clips)
    /^(https?:\/\/)?(www\.)?twitch\.tv\/(videos|clips)\/.+$/i,
    // Direct video file links (common extensions)
    /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i,
  ];

  return videoPatterns.some((pattern) => pattern.test(url));
}

export function extractYouTubeVideoId(url: string): string | null {
  // Regex covers various YouTube URL patterns
  const regex =
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/|shorts\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1]! : null;
}
