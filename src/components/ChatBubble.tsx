import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FiCalendar } from "react-icons/fi";

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  timelineReference?: string;
}

export function ChatBubble({ content, isUser, timestamp, timelineReference }: ChatBubbleProps) {
  const formatTimelineRef = (ref: string) => {
    return ref.split(/(?=[A-Z])/).join(" ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start"
      )}
    >
      {timelineReference && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <FiCalendar className="h-3 w-3" />
          <span>{formatTimelineRef(timelineReference)}</span>
        </div>
      )}
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm">{content}</p>
      </div>
      <span className="text-xs text-muted-foreground mt-1">
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
} 