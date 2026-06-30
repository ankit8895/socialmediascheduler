"use client";

import { cn } from "@/lib/utils";
import { addMinutes, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { CalendarDays, Check, ChevronDown, Clock } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/8bit/button";
import { Calendar } from "../ui/8bit/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/8bit/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/8bit/select";

interface ScheduleDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string;
  setTime: (time: string) => void;
  className?: string;
  align?: "start" | "center" | "end";
  renderButton?: (
    isDatePassed: boolean,
    isTimeNotAvailable: boolean,
  ) => React.ReactNode;
}

const generateTimeOptions = () => {
  const options: string[] = [];
  const baseDate = startOfDay(new Date());
  for (let i = 0; i < 24 * 4; i++) {
    options.push(format(addMinutes(baseDate, i * 15), "h:mm a"));
  }
  return options;
};

const timeOptions = generateTimeOptions();

const ScheduleDatePicker = ({
  date,
  setDate,
  time,
  setTime,
  className,
  align = "end",
  renderButton,
}: ScheduleDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);

  const availableTimeOptions = useMemo(() => {
    if (!date || !isSameDay(date, new Date())) return timeOptions;
    const now = new Date();
    return timeOptions.filter((slot) => {
      const [timeValue, meridiem] = slot.split(" ");
      const [rawHour, rawMinute] = timeValue.split(":").map(Number);
      // hour
      const hour =
        meridiem === "PM" && rawHour !== 12
          ? rawHour + 12
          : meridiem === "AM" && rawHour === 12
            ? 0
            : rawHour;
      const candidate = new Date(date);
      candidate.setHours(hour, rawMinute, 0, 0);
      return !isBefore(candidate, now);
    });
  }, [date]);

  useEffect(() => {
    if (!time && availableTimeOptions.length > 0) {
      setTime(availableTimeOptions[0]);
      return;
    }
    if (time) {
      setTime(time);
    }
  }, [availableTimeOptions, setTime, time]);

  const isDatePassed = date
    ? isBefore(date, new Date()) && !isSameDay(date, new Date())
    : false;
  const isTimeNotAvailable = time
    ? !availableTimeOptions.includes(time)
    : false;

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
  };
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size={"lg"}
            className={cn("px-4", className)}
            variant={"outline"}
          >
            <span className="flex flex-1 items-center gap-2 text-sm">
              <CalendarDays className="size-4" />
              <span className="flex items-center gap-1.5 font-semibold">
                {date ? format(date, "MMMM d") : "Set Date & Time"}
                {date && time && (
                  <span className="text-muted-foreground">, {time}</span>
                )}
              </span>
            </span>
            <ChevronDown className="size-4!" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-70 p-0" align={align}>
          <div className="w-full p-4 space-y-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={{ before: today }}
              className="p-0 w-full"
              formatters={{
                formatWeekdayName: (date) =>
                  date.toLocaleDateString("en-US", { weekday: "narrow" }),
              }}
              classNames={{
                month_caption: "flex justify-start items-center h-9 ml-2",
                caption_label: "text-base font-semibold",
                nav: "absolute right-2 top-0 flex items-center gap-1",
                month: "space-y-4 w-full",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg hover:bg-muted transition-colors",
                ),
              }}
            />

            <div className="space-y-1">
              <h4 className="text-[13px] font-semibold text-foreground/70">
                Select Time
              </h4>
              <div className="flex items-center gap-2">
                <Select value={time} onValueChange={handleTimeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-50">
                    {availableTimeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        <Clock className="size-3" />
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end p-4 border-t bg-muted/5">
            <Button size={"lg"} className="" onClick={() => setOpen(false)}>
              <Check className="size-4" />
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {renderButton && renderButton(isDatePassed, isTimeNotAvailable)}
    </>
  );
};

export default ScheduleDatePicker;
