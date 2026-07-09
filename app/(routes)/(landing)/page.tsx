"use client";

import Logo from "@/components/logo";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import { Button } from "@/components/ui/8bit/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/8bit/dropdown-menu";
import { ChannelTypeEnum, getChannelIcon } from "@/constants/channels";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Link from "next/link";

const navItems = ["Features", "Channels", "Made for", "Resources", "Pricing"];

const platformBadges = [
  // left column - stacked vertically, stays in left ~15% of the container
  {
    type: ChannelTypeEnum.TWITTER,
    color: "#000000",
    className: "left-[2%] top-[8%]",
  },
  {
    type: ChannelTypeEnum.LINKEDIN,
    color: "#2867b2",
    className: "left-[6%] top-[32%]",
  },
  {
    type: ChannelTypeEnum.YOUTUBE,
    color: "#FF0000",
    className: "left-[2%] top-[56%]",
  },

  // Right column - stacked vertically, stays in right ~15% of the container
  {
    type: ChannelTypeEnum.BLUESKY,
    color: "#1285fe",
    className: "right-[2%] top-[8%]",
  },
  {
    type: ChannelTypeEnum.INSTAGRAM,
    color: "#E4405F",
    className: "right-[6%] top-[32%]",
  },
  {
    type: ChannelTypeEnum.THREADS,
    color: "#000000",
    className: "right-[2%] top-[56%]",
  },
  {
    type: ChannelTypeEnum.FACEBOOK,
    color: "#1877F2",
    className: "right-[9%] top-[56%]",
  },
];

const stats = [
  { value: "8", label: "social platforms supported" },
  { value: "1", label: "workspace for planning and scheduling" },
  { value: "AI", label: "built into drafting and publishing" },
];

const featurePanels = [
  {
    title: "The cleanest way to plan your week",
    description:
      "See your ideas, drafts, and scheduled posts in one place without juggling tabs and spreadsheets",
    tone: "bg-[#ead6ff]",
  },
  {
    title: "Customize once, publish everywhere",
    description:
      "Start with a global draft, fine-tune each channel, and keep every post matched to the platform.",
    tone: "bg-[#d7f2b7]",
  },
];

const Home = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  return (
    <div className="min-h-screen bg-background text-foreground font-pixel">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo className="shrink-0" />
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>{item}</span>
                {item !== "Pricing" && <ChevronDown className="h-4 w-4" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/sign-in">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/sign-up">Get Started for free</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="default"
                  className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/dashboard">Open workspace</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer">
                      <Avatar className="h-8 w-8 flex gap-2">
                        <AvatarImage
                          src={user?.imageUrl}
                          alt={user?.fullName || "User"}
                          className="rendering-pixelated"
                        />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openUserProfile()}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="text-destructive"
                    >
                      Signout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(248,250,252,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.08)_1px,transparent_1px)] bg-size-[56px_56px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-background to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-background to-transparent" />

          <div className="relative mx-auto flex min-h-180 max-w-7xl flex-col px-6 pb-16 pt-16">
            <div className="absolute hidden inset-0 md:block pointer-events-none">
              {/* FADE BADGES TOWARD CENTER */}
              <div className="absolute inset-y-0 left-0 w-[22%] bg-linear-to-r from-transparent to-background/0 z-10" />
              <div className="absolute inset-y-0 right-0 w-[22%] bg-linear-to-l from-transparent to-background/0 z-10" />

              {platformBadges.map((platform) => {
                const icon = getChannelIcon(platform.type);
                return (
                  <div
                    key={platform.type}
                    className={`absolute ${platform.className} rounded-2xl border border-border/60 bg-card p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.24)] opacity-70 hover:opacity-100 transition-opacity`}
                  >
                    {icon && (
                      <div
                        className="flex size-9 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: platform.color }}
                      >
                        <HugeiconsIcon
                          icon={icon}
                          color="currentColor"
                          className="size-5"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="z-10 mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-4 py-1 text-sm text-foreground shadow-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  Plan ideas, customize by channel, and publish with AI
                </span>
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
                Your social media workspace
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Draft faster, stay organized, and schedule content across every
                channel without the usual mess.
              </p>

              {isSignedIn ? (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href={"/sign-up"}>
                      Get started for free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={"outline"}
                    className="h-12 rounded-full px-6 text-base"
                  >
                    <Link href={"/sign-in"}>Log in</Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90"
                  >
                    <Link href={"/schedule"}>
                      Open workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={"outline"}
                    className="h-12 rounded-full px-6 text-base"
                  >
                    <Link href={"/ideas"}>View ideas</Link>
                  </Button>
                </div>
              )}

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[28px] border border-border/60 bg-card/85 px-6 py-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
                  >
                    <div className="text-4xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </div>
                    <div className="mt-3 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 md:grid-cols-2">
          {featurePanels.map((panel) => (
            <div
              key={panel.title}
              className={`${panel.tone} rounded-[28px] p-8 dark:border-border/60 dark:bg-card`}
            >
              <div className="max-w-md">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {panel.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {panel.description}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;
