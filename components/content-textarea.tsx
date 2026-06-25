import React, { useRef, useState } from "react";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";
import { ImageObject } from "@/types/post.type";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/8bit/textarea";
import { Spinner } from "./ui/8bit/spinner";
import { ImagePlus, SmileIcon, Wand2Icon, X } from "lucide-react";
import { Input } from "./ui/8bit/input";
import Image from "next/image";
import { Button } from "./ui/8bit/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/8bit/popover";
import { Separator } from "./ui/separator";

interface ContentTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contentClass?: string;
  minHeight?: number;
  showAIAssistant?: boolean;
  onAIAssistantClick?: () => void;
  showHashing?: boolean;
  className?: string;
  images?: ImageObject[];
  onImagesChange?: (images: ImageObject[]) => void;
  renderToolbarRight?: React.ReactNode;
  renderContent?: React.ReactNode;
  disabled?: boolean;
}

const ContentTextarea = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  contentClass,
  minHeight = 280,
  showAIAssistant = false,
  onAIAssistantClick,
  className,
  images = [],
  onImagesChange,
  renderToolbarRight,
  renderContent,
  disabled = false,
}: ContentTextareaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const insertEmoji = (emoji: string) => {
    if (disabled) return;
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${emoji}`);
      setEmojiOpen(false);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;

    onChange(nextValue);
    setEmojiOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImage = [...images];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        const result = await response.json();
        if (result.image) {
          newImage.push({
            url: result.image.url,
            key: result.image.key,
          });
        }
      }
      onImagesChange?.(newImage);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange?.(images.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("flex flex-col border-none relative", className)}>
      {/* EDITABLE AREA */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "bg-transparent ring-0! border-none! resize-none! pt-0! pl-0! pr-0!",
          "placeholder:text-muted-foreground/80",
          disabled && "opacity-50 cursor-not-allowed",
          contentClass && contentClass,
        )}
        style={{ minHeight: minHeight, maxHeight: "400px" }}
      />

      <div className="shrink-0">
        {/* IMAGE UPLOAD SECTION */}
        <div className="flex items-center gap-3 mt-2 mb-5">
          {/* ADD IMAGE BUTTON */}
          <div
            onClick={() =>
              !isUploading && !disabled && fileInputRef.current?.click()
            }
            className={cn(
              `shrink-0 size-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors mb-3 shadow-sm`,
              (isUploading || disabled) && "opacity-50 cursor-not-allowed",
              disabled && "grayscale",
            )}
          >
            {isUploading ? (
              <Spinner />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
            )}

            <span className="text-xs text-center text-muted-foreground">
              {isUploading ? "Uploading..." : "Select file"}
            </span>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* UPLOAD IMAGES - SCROLLABLE CONTAINER */}
          {images.length > 0 && (
            <div className="flex gap-3 w-full max-w-115 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div
                  key={image.key || index}
                  className="shrink-0 relative size-24 rounded-lg overflow-hidden border"
                >
                  <Image
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                  <Button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="shrink-0 absolute w-full -bottom-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" disabled={disabled}>
                  <SmileIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-75 p-0!">
                <EmojiPicker
                  onEmojiSelect={insertEmoji}
                  className="w-full! rounded-lg bg-popover ring-0!"
                >
                  <EmojiPicker.Header className="border-b border-border pb-2">
                    <EmojiPicker.Input
                      placeholder="Search emoji"
                      autoFocus
                      className="h-8 border border-border! bg-background ring-0!"
                    />
                  </EmojiPicker.Header>
                  <EmojiPicker.Group>
                    <EmojiPicker.List hideStickyHeader containerHeight={320} />
                  </EmojiPicker.Group>
                </EmojiPicker>
              </PopoverContent>
            </Popover>
            <Separator orientation="vertical" className="mx-0 my-1.5" />
            {showAIAssistant && (
              <Button
                variant={"ghost"}
                size={"sm"}
                className="ml-1 h-7 gap-1.5 text-sm"
                onClick={onAIAssistantClick}
                disabled={disabled}
              >
                <Wand2Icon className="h-3.5 w-3.5" />
                AI Assistant
              </Button>
            )}
          </div>
          {renderToolbarRight && (
            <div className="flex items-center gap-2">{renderToolbarRight}</div>
          )}
        </div>
        {renderContent && <>{renderContent}</>}
      </div>
    </div>
  );
};

export default ContentTextarea;
