import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Profile } from "@/components/profile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Profile
      initialName={session.user.name ?? ""}
      email={session.user.email ?? ""}
    />
  );
}
