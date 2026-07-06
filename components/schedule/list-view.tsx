import { PostType } from "@/types/post.type";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/8bit/tabs";
import { Badge } from "../ui/8bit/badge";
import ScheduleToolbar from "./schedule-toolbar";
import { Skeleton } from "../ui/8bit/skeleton";
import {
  AlarmClockCheck,
  ExternalLink,
  LayoutList,
  Pin,
  Plus,
  Send,
} from "lucide-react";
import { Button } from "../ui/8bit/button";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Card, CardContent, CardFooter } from "../ui/8bit/card";
import ChannelAvatar from "../channel-avatar";
import Image from "next/image";
import Link from "next/link";
import EditPostDialog from "./edit-post-dialog";
import { PostStatus } from "@/constants/post";

type TabType = "draft" | "queue" | "published" | "failed";

type GroupPostType = {
  key: string;
  label: string;
  posts: PostType[];
};

const ListView = ({
  setCreatePostModalOpen,
}: {
  setCreatePostModalOpen: (open: boolean) => void;
}) => {
  const [activeTab, setActiveTab] = useQueryState("status", {
    defaultValue: "draft",
  });
  const [channelIds, setChannelIds] = useQueryState("channelIds", {
    defaultValue: [],
    parse: (query) => query.split(","),
    serialize: (value) => value.join(","),
  });

  const [selectedPostForEdit, setSelectedPostForEdit] =
    useState<PostType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["posts", activeTab, channelIds],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("group_by_date", "true");
      if (activeTab) params.append("status", activeTab);

      if (channelIds.length > 0)
        params.append("channelIds", channelIds.join(","));

      const res = await fetch(`/api/post?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: totalPosts } = useQuery({
    queryKey: ["posts", "totals", channelIds],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (channelIds.length > 0)
        params.append("channelIds", channelIds.join(","));

      const res = await fetch(`/api/post/totals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const groupPosts = (data?.groupPosts || []) as GroupPostType[];

  const totalDrafts = totalPosts?.totalDrafts || 0;
  const totalQueue = totalPosts?.totalQueue || 0;
  const totalPublished = totalPosts?.totalPublished || 0;
  const totalFailed = totalPosts?.totalFailed || 0;

  const toggleChannel = (channelId: string) => {
    setChannelIds((prev) => {
      if (!prev) {
        return [channelId];
      }
      if (prev.includes(channelId)) {
        const filtered = prev.filter((id) => id !== channelId);
        return filtered.length === 0 ? null : filtered;
      }
      return [...prev, channelId];
    });
  };

  const handleEditPost = (post: PostType) => {
    setSelectedPostForEdit(post);
    setIsEditDialogOpen(true);
  };

  const handlePublishNow = (post: PostType) => {};
  return (
    <>
      <div className="flex flex-col h-full pt-3">
        <div className="flex items-center justify-between border-b px-6">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val)}>
            <TabsList variant={"line"} className="space-x-4">
              <TabsTrigger value="draft">
                Draft <Badge variant={"secondary"}>{totalDrafts}</Badge>
              </TabsTrigger>
              <TabsTrigger value="queue">
                Queue <Badge variant={"secondary"}>{totalQueue}</Badge>
              </TabsTrigger>
              <TabsTrigger value="published">
                Published <Badge variant={"secondary"}>{totalPublished}</Badge>
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed <Badge variant={"secondary"}>{totalFailed}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScheduleToolbar
            viewType="list"
            channelIds={channelIds}
            toggleChannel={toggleChannel}
            selectedStatus={activeTab}
            setSelectedStatus={setActiveTab}
          />
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-225 mx-auto w-full space-y-2">
            {isPending ? (
              <div className="space-y-8">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-10 w-56 rounded-md" />
                    <Skeleton className="h-75 w-full" />
                  </div>
                ))}
              </div>
            ) : groupPosts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center">
                <div className="max-w-sm space-y-4">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
                    <LayoutList className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold capitalize">
                    No {activeTab === "queue" ? "scheduled" : activeTab} post
                    yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connect a channel and create your first post to get started
                    with scheduling.
                  </p>
                  <Button
                    size={"lg"}
                    onClick={() => setCreatePostModalOpen(true)}
                  >
                    <Plus className="size-4" />
                    Create Post
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-5">
                {groupPosts.map((group) => (
                  <div key={group.key}>
                    <h2 className="text-lg font-medium">{group.label}</h2>
                    <div className="space-y-6">
                      {group.posts.map((post) => {
                        const scheduleDate = parseISO(post.scheduled_at);
                        const channel = post.user_channels?.channel_types;
                        const previewImage = post.images?.[0]?.url;
                        return (
                          <div
                            key={post.id}
                            className="grid gap-2 lg:grid-cols-2-[120px_minmax(0,1fr)]"
                          >
                            <div>
                              <h5>{format(scheduleDate, "h:mm a")}</h5>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Pin className="size-4" />
                                <span>
                                  {post.status === "draft" ? "Draft" : "Custom"}
                                </span>
                              </div>
                            </div>

                            <Card className="py-0 gap-0">
                              <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_250px]">
                                <div className="space-y-5">
                                  {channel ? (
                                    <ChannelAvatar
                                      type={channel.type}
                                      color={channel.color}
                                      profileImage={
                                        post.user_channels?.profile_image
                                      }
                                      name={
                                        post.user_channels?.handle ||
                                        channel.name
                                      }
                                    />
                                  ) : null}

                                  <p className="whitespace-pre-wrap text-sm leading-6 line-clamp-4">
                                    {post.content}
                                  </p>
                                </div>

                                <div className="max-h-41.25 overflow-hidden rounded-2xl border bg-muted/40">
                                  {previewImage ? (
                                    <Image
                                      src={previewImage}
                                      alt="Post media"
                                      width={0}
                                      height={0}
                                      sizes="100vw"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center bg-muted/60 text-sm text-muted-foreground">
                                      No media
                                    </div>
                                  )}
                                </div>
                              </CardContent>

                              <CardFooter className="flex flex-col gap-4 border-t px-6 py-3 md:flex-row md:items-center md:justify-between">
                                <p className="text-sm text-muted-foreground">
                                  {post.status === "published" ? (
                                    <>
                                      Published via{" "}
                                      <span className="font-medium text-foreground">
                                        {channel?.name || "Channel"}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      You created this{" "}
                                      <span className="font-medium text-foreground">
                                        {formatDistanceToNow(
                                          parseISO(post.created_at),
                                        )}
                                      </span>{" "}
                                      ago
                                    </>
                                  )}
                                </p>

                                <div className="flex items-center gap-3">
                                  {post.published_url &&
                                  post.status === "published" ? (
                                    <Button variant={"outline"} asChild>
                                      <Link
                                        href={post.published_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        View Post
                                      </Link>
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant={"outline"}
                                        onClick={() => handleEditPost(post)}
                                      >
                                        <AlarmClockCheck className="size-4" />
                                        Reschedule
                                      </Button>

                                      {post.status === "draft" && (
                                        <Button
                                          variant={"outline"}
                                          onClick={() => handlePublishNow(post)}
                                        >
                                          <Send className="size-4" />
                                          Publish Now
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </CardFooter>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditPostDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        post={
          selectedPostForEdit
            ? {
                id: selectedPostForEdit.id,
                content: selectedPostForEdit.content,
                images: selectedPostForEdit.images || [],
                scheduledDate: selectedPostForEdit.scheduled_at,
                userChannelId: selectedPostForEdit.user_channel_id || "",
                channel: selectedPostForEdit.user_channels?.channel_types
                  ? {
                      ...selectedPostForEdit.user_channels.channel_types,
                      profile_image:
                        selectedPostForEdit.user_channels.profile_image,
                      handle: selectedPostForEdit.user_channels.handle,
                    }
                  : null,
              }
            : null
        }
      />
    </>
  );
};

export default ListView;
