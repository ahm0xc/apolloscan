import { SignUp } from "@clerk/nextjs";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ videoUrl?: string }>;
}) {
  const { videoUrl } = await searchParams;

  return <SignUp forceRedirectUrl={`/?videoUrl=${videoUrl}&autoCheck=true`} />;
}
