"use client";

import { ChannelType } from "@/types/channel.type";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/8bit/card";
import { Skeleton } from "../ui/8bit/skeleton";
import { getChannelIcon } from "@/constants/channels";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "../ui/8bit/button";

function ChannelTabContent() {
  const searchParams = useSearchParams();

  const { data: channelsData, isPending } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const res = await fetch("/api/channel");
      const data = await res.json();
      return data;
    },
  });

  const channels = (channelsData?.channels || []) as ChannelType;

  const handleConnect = (userChannelId: string) => {
    if (!userChannelId) return;
  };
  const handleDisconnect = (userChannelId: string) => {
    if (!userChannelId) return;
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channels</CardTitle>
        <CardDescription>
          Connect your social media accounts to start scheduling
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {isPending
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-6 rounded-sm bg-secondary" />
                    <Skeleton className="h-5 w-24 bg-secondary" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-secondary" />
                </div>
              ))
            : channels?.map((channel: ChannelType) => {
                const icon = getChannelIcon(channel.type);
                return (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="relative">
                        {icon ? (
                          <HugeiconsIcon
                            icon={icon}
                            color="currentColor"
                            className="text-white! size-6! p-1 rounded-sm"
                          />
                        ) : null}

                        <div
                          className={cn(
                            `absolute -right-1 bottom-0 p-0.5 bg-white dark:bg-background rounded-xs`,
                            {
                              "bg-transparent p-0 rounded-full -bottom-1 -right-0.5":
                                channel.connected,
                            },
                          )}
                        >
                          {channel.connected ? (
                            <div className="size-2.5 bg-primary rounded-full" />
                          ) : (
                            <HugeiconsIcon
                              icon={PlusSignIcon}
                              className="size-2!"
                            />
                          )}
                        </div>
                      </span>

                      <span className="font-medium">{channel.name}</span>
                    </div>

                    <Button
                      variant={channel.connected ? "destructive" : "default"}
                      size="sm"
                      onClick={() =>
                        channel.connected
                          ? handleDisconnect(channel.userChannelId!)
                          : handleConnect(channel.userChannelId!)
                      }
                    >
                      {channel.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}

const ChannelsTab = () => {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading channels...</div>
      }
    >
      <ChannelTabContent />
    </Suspense>
  );
};

export default ChannelsTab;
