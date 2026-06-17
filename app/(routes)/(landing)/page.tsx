import Logo from "@/components/logo";
import { Button } from "@/components/ui/8bit/button";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav></nav>
          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/sign-in">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full px-5 text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" className="rounded-full px-5">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
                <UserButton
                  appearance={{ elements: { avatarBox: "h-9 w-9" } }}
                />
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
