import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="h-dvh flex items-center justify-center">
      <UserProfile />
    </div>
  );
}
