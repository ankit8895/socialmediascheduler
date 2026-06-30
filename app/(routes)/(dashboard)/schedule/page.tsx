"use client";

import CalendarView from "@/components/schedule/calendar-view";
import CreatePostDialog from "@/components/schedule/create-post-dialog";
import ListView from "@/components/schedule/list-view";
import { Button } from "@/components/ui/8bit/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/8bit/toggle-group";
import { CalendarIcon, LayoutList, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, useState } from "react";

type ViewType = "calender" | "list";

const SchedulePageContent = () => {
  const [activeView, setActiveView] = useQueryState("views", {
    defaultValue: "calender",
  });
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 pt-4 pb-2">
        <div>
          <h1 className="text-xl font-semibold">All Channels</h1>
        </div>

        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={activeView}
            onValueChange={(value) => setActiveView(value as ViewType)}
            className="border rounded-lg p-px"
          >
            <ToggleGroupItem value="list" className="gap-2 my-px">
              <LayoutList className="size-4" />
              <span className="text-sm">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" className="gap-2 my-px">
              <CalendarIcon className="size-4" />
              <span className="text-sm">Calendar</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <Button onClick={() => setCreatePostModalOpen(true)}>
            <Plus className="size-4" />
            Add Post
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeView === "list" ? <ListView /> : <CalendarView />}
      </div>

      <CreatePostDialog
        open={createPostModalOpen}
        onOpenChange={setCreatePostModalOpen}
      />
    </div>
  );
};

const SchedulePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NuqsAdapter>
        <SchedulePageContent />
      </NuqsAdapter>
    </Suspense>
  );
};

export default SchedulePage;
