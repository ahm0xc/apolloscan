import Link from "next/link";

export default function SidebarLogo() {
  return (
    <Link href="/">
      <div className="flex items-center gap-2 justify-center py-2 group-data-[state=expanded]:py-3">
        <img
          src="/images/logo.png"
          alt="Apollo Scan"
          className="h-7 w-auto group-data-[state=collapsed]:h-6"
        />
        <span className="text-xl font-medium group-data-[state=collapsed]:hidden">
          Apollo Scan
        </span>
      </div>
    </Link>
  );
}
