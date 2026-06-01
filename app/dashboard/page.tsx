import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Dashboard } from "@/components/dashboard";

export default async function DashboardPage() {
  // Protect the route: only signed-in users can see their dashboard.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return <Dashboard userEmail={session.user.email ?? ""} />;
}
