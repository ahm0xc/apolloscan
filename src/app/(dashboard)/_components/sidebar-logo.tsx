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
        <span className="text-xl font-medium group-data-[state=collapsed]:hidden flex items-center">
          Apollo Scan
          <span className="ml-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded-md font-semibold">
            BETA
          </span>
        </span>
      </div>
    </Link>
  );
}
