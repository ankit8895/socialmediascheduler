import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/8bit/avatar";
import { Card, CardContent } from "@/components/ui/8bit/card";
import {
  BarChart2,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";
import Image from "next/image";

interface TwitterPreviewProps {
  text: string;
  images?: string[];
  profileImage?: string;
  handle?: string;
}

const TwitterPreview = ({
  text,
  images,
  profileImage,
  handle,
}: TwitterPreviewProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <Avatar className="size-9">
            <AvatarImage src={profileImage || "./images/avatar.webp"} />
            <AvatarFallback>LM</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">{handle || "Aigogo"}</span>
              <span className="text-xs text-muted-foreground">
                @{handle || "aigogo"}
              </span>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap wrap-break-word">
              {text || (
                <span className="text-muted-foreground italic">
                  Nothing yet...
                </span>
              )}
            </p>

            {/* IMAGES DISPLAY */}
            {images && images.length > 0 && (
              <div
                className={`mt-3 grid gap-1 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image}
                      alt={`Tweet image ${index + 1}`}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="rounded-lg w-full h-25 object-cover"
                    />

                    {index === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl font-semibold">
                          +{images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-5 text-muted-foreground">
              <MessageCircle className="size-4" />
              <Repeat2 className="size-4" />
              <Heart className="size-4" />
              <BarChart2 className="size-4 " />
              <Bookmark className="size-4 " />
              <Share className="size-4 " />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwitterPreview;
