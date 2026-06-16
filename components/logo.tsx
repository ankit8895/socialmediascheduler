"use client";
import { cn } from "@/lib/utils";
import { Brain } from "lucide-react";

interface LogoProps {
  name?: string;
  className?: string;
  hideName?: boolean;
}

const Logo = ({
  name = "AI-GO-GO",
  className,
  hideName = false,
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Brain className="h-4 w-4" />
      </div>
      {!hideName && (
        <span className="text-lg font-bold font-pixel">{name}</span>
      )}
    </div>
  );
};

export default Logo;
