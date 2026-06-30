import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Heart, MessageCircle, Plus, Repeat2, Send } from "lucide-react";
import Image from "next/image";

interface ThreadPreviewProps {
  text: string;
  images?: string[];
  profileImage?: string;
  handle?: string;
}

const ThreadPreview = ({
  text,
  images,
  profileImage,
  handle,
}: ThreadPreviewProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={profileImage || "./images/avatar.webp"} />
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 size-4 bg-black rounded-full flex items-center justify-center border-2 border-white">
              <Plus className="size-2.5 text-white stroke-[3px]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold">
                {handle || "aigogo"}
              </span>
              <span className="text-xs text-muted-foreground">21h</span>
            </div>
            <p className="mt-1 text-sm leading-normal whitespace-pre-wrap wrap-break-word">
              {text || (
                <span className="text-muted-foreground italic">
                  Nothing yet...
                </span>
              )}
            </p>

            {/* IMAGES DISPLAY - HORIZONTAL SCROLL BASED ON SCREENSHOT */}
            {images && images.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative shrink-0 w-[85%] aspect-3/3 max-w-75"
                  >
                    <Image
                      src={image}
                      alt={`Thread image ${index + 1}`}
                      className="rounded-xl w-full h-full object-cover border border-border/50"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="relative mt-3 flex items-center gap-4 text-muted-foreground">
              <Heart className="size-4" />
              <MessageCircle className="size-4 transform -rotate-90" />
              <Repeat2 className="size-5" />
              <Send className="size-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreadPreview;
