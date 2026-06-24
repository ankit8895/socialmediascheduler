import { IdeaType } from "@/types/idea.type";
import { ImageObject } from "@/types/post.type";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/8bit/dialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/8bit/select";
import { Shapes } from "lucide-react";
import { Input } from "../ui/8bit/input";
import { Button } from "../ui/8bit/button";
import { Spinner } from "../ui/8bit/spinner";
import ContentTextarea from "../content-textarea";
import { Textarea } from "../ui/8bit/textarea";

type IdeaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea?: IdeaType;
  selectedColumnId: string;
  isSaving?: boolean;
  onSave: (idea: IdeaType) => void;
  columns?: { id: string; title: string }[];
};

const IdeaDialog = ({
  open,
  onOpenChange,
  idea,
  selectedColumnId,
  isSaving,
  columns,
  onSave,
}: IdeaDialogProps) => {
  const isEdit = !!idea?.id;
  const [title, setTitle] = useState(idea?.title ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [images, setImages] = useState<ImageObject[]>(idea?.images ?? []);
  const [selectedColumn, setSelectedColumn] = useState(
    idea?.columnId ?? selectedColumnId,
  );
  const [showAI, setShowAI] = useState<boolean>(false);

  useEffect(() => {
    setTitle(idea?.title ?? "");
    setDescription(idea?.description ?? "");
    setImages(idea?.images ?? []);
    setSelectedColumn(idea?.columnId ?? selectedColumnId);
    setShowAI(false);
  }, [idea, selectedColumnId]);

  const handleSave = () => {
    onSave({
      id: idea?.id,
      title: title,
      description,
      images,
      columnId: selectedColumn,
      sortOrder: idea?.sortOrder,
    });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          `flex max-h-[90vh] gap-0 p-0 overflow-hidden sm:w-[95%] sm:min-w-137.5`,
          showAI && "sm:max-w-225",
        )}
      >
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-1 flex-col min-w-0">
            <DialogHeader className="shrink-0 flex flex-row items-center justify-between px-5 py-4">
              <DialogTitle className="text-base font-semibold">
                {isEdit ? "Edit Idea" : "Create idea"}
              </DialogTitle>

              <div>
                <Select
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                >
                  <SelectTrigger className="min-w-25 max-w-33.75 gap-1! mr-5 text-sm">
                    <Shapes />
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns?.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DialogHeader>

            <div className="flex flex-1 flex-col gap-px overflow-y-auto px-5 py-2 min-h-0">
              <Textarea
                value={title}
                placeholder="Give your idea a title"
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-w-0 border-0 px-0 text-xl! font-semibold
          shadow-none placeholder:font-semibold bg-transparent! resize-none! whitespace-pre-wrap wrap-break-word
          overflow-wrap-anywhere overflow-hidden
          focus-visible:ring-0"
              />

              <ContentTextarea
                value={description}
                onChange={setDescription}
                placeholder="Everthing begins with an idea"
                images={images}
                onImagesChange={setImages}
                showAIAssistant={true}
                onAIAssistantClick={() => setShowAI((value) => !value)}
              />
            </div>

            <div className="shrink-0 flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <Button
                size="lg"
                disabled={isSaving || !title.trim()}
                onClick={handleSave}
              >
                {isSaving && <Spinner />}
                Save Idea
              </Button>
            </div>
          </div>

          {showAI && (
            <div className="w-85 shrink-0 border-l border-border bg-muted/30">
              <div className="p-4">
                {/* <AIAssistant
                  content={`${title}\n\n${description}`}
                  onGenerate={(content) => {
                    setDescription(content);
                  }}
                /> */}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaDialog;
