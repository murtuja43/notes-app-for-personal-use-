import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { NotebookPen } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";

export default async function LandingPage() {
  // If already signed in, go straight to the dashboard.
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <NotebookPen className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          NoteAll
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A simple, fast notes app. Sign in once and access your notes from the
          web, Android, or iPhone.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
