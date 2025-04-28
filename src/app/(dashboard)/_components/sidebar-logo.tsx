import Link from "next/link";

import { Logo, LogoIcon } from "~/components/logo";

export default function SidebarLogo() {
  return (
    <Link href="/">
      <div className="flex items-center justify-center py-2 group-data-[state=expanded]:py-4">
        <Logo className="group-data-[state=collapsed]:hidden h-6 w-auto" />
        <LogoIcon className="group-data-[state=collapsed]:block hidden h-6" />
      </div>
    </Link>
  );
}
