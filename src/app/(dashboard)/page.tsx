import Image from "next/image";
import Link from "next/link";

import { SparkleIcon } from "lucide-react";

import { cn } from "~/lib/utils";

import FactCheckerForm from "./_components/fact-checker-form";

export default function Page() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center relative">
      <FloatingImages />
      <section className="flex flex-col gap-4 items-center px-4 sm:px-6 md:px-8">
        <div className="border h-6 sm:h-8 rounded-full flex items-center gap-2 px-2 text-xs sm:text-sm text-muted-foreground hover:bg-accent transition-colors">
          <SparkleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Boost your productivity
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center">
            <span>Know if a video</span> <br />{" "}
            <span className="bg-gradient-to-br from-purple-600 via-pink-400 to-fuchsia-600 bg-clip-text text-transparent">
              tells the truth.
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg text-pretty text-center max-w-[280px] sm:max-w-md mx-auto mt-2 sm:mt-4">
            Fact Check everything you see online with AI-powered precision and
            accuracy.
          </p>
        </div>
        <div>
          <FactCheckerForm />
        </div>
      </section>

      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
        <Link href="/privacy-policy" className="hover:underline mr-4">
          Privacy Policy
        </Link>
        <Link href="/imprint" className="hover:underline">
          Imprint
        </Link>
      </div>
    </div>
  );
}

function FloatingImages() {
  return (
    <>
      <FloatingImage
        src="/images/home/floating-image-1.jpg"
        className="absolute left-[2vw] top-[5vh] -rotate-12 scale-90 sm:scale-90 md:scale-100 lg:left-[10vw] lg:top-[10vh]"
        percentage={80}
      />
      <FloatingImage
        src="/images/home/floating-image-2.jpg"
        className="absolute right-[2vw] top-[5vh] rotate-12 scale-90 sm:scale-90 md:scale-100 lg:right-[10vw] lg:top-[10vh]"
        percentage={63}
      />
      <FloatingImage
        src="/images/home/floating-image-3.jpg"
        className="absolute left-[2vw] bottom-[5vh] rotate-12 scale-90 sm:scale-90 md:scale-100 lg:left-[10vw] lg:bottom-[10vh]"
        percentage={93}
      />
      <FloatingImage
        src="/images/home/floating-image-4.jpg"
        className="absolute right-[2vw] bottom-[5vh] -rotate-12 scale-90 sm:scale-90 md:scale-100 lg:right-[10vw] lg:bottom-[10vh]"
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
  const isHighPercentage = percentage && percentage >= 80;

  return (
    <div
      className={cn(
        "w-fit border-2 border-dashed p-1.5 sm:p-2 rounded-[16px] sm:rounded-[24px]",
        isHighPercentage
          ? "bg-green-50 border-green-100"
          : "bg-red-50 border-red-100",
        className
      )}
    >
      <div className="relative">
        <Image
          src={src}
          alt=""
          width={600}
          height={600}
          sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
          className="rounded-[calc(16px-6px)] sm:rounded-[calc(24px-8px)] w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-video h-auto object-cover"
        />
        {percentage && (
          <div
            className={cn(
              "absolute top-1 sm:top-2 -right-2 sm:-right-4 border text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold",
              isHighPercentage
                ? "bg-green-50 border-green-100 text-green-800"
                : "bg-red-50 border-red-100 text-red-800"
            )}
          >
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}
