import { useGame } from "@/contexts/GameContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { getCharacterResponse } from "@/lib/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GameScreen = () => {
  const { selectedCharacter } = useGame();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    setInputValue("");

    try {
      const response = await getCharacterResponse(
        selectedCharacter as any,
        userMessage,
        messages
      );

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response
      }]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble responding right now. Can you try again?" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-green via-game-blue to-game-pink p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Talking with {selectedCharacter}</h2>
        
        <div className="h-[400px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-gray-500 italic">
              {selectedCharacter} is typing...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(inputValue);
              }
            }}
          />
          <Button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={isTyping || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameScreen; 