import type { ReactNode } from "react";

import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Button asChild variant="outline">
        <Link className="absolute top-4 left-4" href="/">
          <ArrowLeftIcon />
          Back to home
        </Link>
      </Button>
      <div className="flex justify-center items-center h-dvh">{children}</div>
    </div>
  );
}
