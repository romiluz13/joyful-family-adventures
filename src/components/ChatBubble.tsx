import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export function ChatBubble({ content, isUser, timestamp }: ChatBubbleProps) {
  const [isTyping, setIsTyping] = useState(!isUser);
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (!isUser) {
      setIsTyping(true);
      setDisplayedContent('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(prev => prev + content[index]);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 30); // Adjust typing speed here

      return () => clearInterval(timer);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isUser]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "flex",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[80%] rounded-lg p-3 relative group",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {isUser ? displayedContent : (
            <>
              {displayedContent}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ▋
                </motion.span>
              )}
            </>
          )}
          
          {timestamp && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute -bottom-5 left-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
            >
              {timestamp.toLocaleTimeString()}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 