import Image from "next/image";

import { SparkleIcon } from "lucide-react";

import { cn } from "~/lib/utils";

import VideoFactCheckerForm from "./video-fact-checker-form";

export default function Page() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center relative">
      <FloatingImages />
      <section className="flex flex-col gap-4 items-center">
        <div className="border h-8 rounded-full flex items-center gap-2 px-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
          <SparkleIcon className="w-4 h-4" />
          Boost your productivity
        </div>
        <div>
          <h1 className="text-6xl font-bold text-center">
            <span>Know if a video</span> <br />{" "}
            <span className="bg-gradient-to-br from-purple-600 via-pink-400 to-fuchsia-600 bg-clip-text text-transparent">
              tells the truth.
            </span>
          </h1>
        </div>
        <div>
          <VideoFactCheckerForm />
        </div>
      </section>
    </div>
  );
}

function FloatingImages() {
  return (
    <>
      <FloatingImage
        src="/images/home/floating-image-1.jpg"
        className="absolute left-[10vw] top-[10vh] -rotate-12"
        percentage={80}
      />
      <FloatingImage
        src="/images/home/floating-image-2.jpg"
        className="absolute right-[10vw] top-[10vh] rotate-12"
      />
      <FloatingImage
        src="/images/home/floating-image-3.jpg"
        className="absolute left-[10vw] bottom-[10vh] rotate-12"
      />
      <FloatingImage
        src="/images/home/floating-image-4.jpg"
        className="absolute right-[10vw] bottom-[10vh] -rotate-12"
        percentage={50}
      />
    </>
  );
}

function FloatingImage({
  className,
  src,
  percentage,
}: {
  className: string;
  src: string;
  percentage?: number;
}) {
  return (
    <div
      className={cn(
        "w-fit bg-red-50 border-2 border-dashed border-red-100 p-2 rounded-[24px]",
        className
      )}
    >
      <div className="relative">
        <Image
          src={src}
          alt=""
          width={300}
          height={300}
          className="rounded-[calc(24px-8px)] w-[200px] sm:w-[260px] md:w-[320px]"
        />
        {percentage && (
          <div className="absolute top-2 -right-4 bg-red-50 border border-red-100 text-red-800 font-semibold text-xs px-2 py-1 rounded-full">
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}
