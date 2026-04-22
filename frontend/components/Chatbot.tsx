"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, MapPin, IndianRupee } from "lucide-react";
import Link from "next/link";
import api from "@/services/api";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  properties?: any[];
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content:
        "Hello! I am BuildEstate AI, your personal real estate assistant. How can I help you find your dream home today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let sId = localStorage.getItem("chat_session_id");
    if (!sId) {
      sId = Math.random().toString(36).substring(7);
      localStorage.setItem("chat_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  const smartQuestions = [
    "Find property under my budget",
    "Properties in my city",
    "Best investment options",
    "Luxury homes",
    "Help me choose",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  //  CLEAN HANDLE SEND (Backend controls everything)
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await api.post("/ai/chat/", { 
        message: text,
        session_id: sessionId 
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.data.reply,
        properties: Array.isArray(response.data.properties)
          ? response.data.properties
          : [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Oops! Something went wrong while connecting to the AI. Please try again.",
      };

      setMessages((prev) => [...prev, errorMsg]);
    }

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-2xl w-80 sm:w-96 h-[500px] sm:h-[600px] mb-4 flex flex-col overflow-hidden border border-gray-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex justify-between items-center bg-blue-600 p-4 text-white rounded-t-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    BuildEstate AI 🤖
                  </h3>
                  <p className="text-xs text-blue-100">Always active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-tl-none"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Properties */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="flex flex-col gap-3 mt-3 w-full">
                      {msg.properties.slice(0, 3).map((prop: any) => (
                        <div
                          key={prop.id}
                          className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm rounded-xl p-3"
                        >
                          {prop.image_url && (
                            <img
                              src={prop.image_url}
                              alt={prop.title}
                              className="w-full h-24 object-cover rounded-md mb-2"
                            />
                          )}
                          <h4 className="font-semibold">{prop.title}</h4>

                          <span className="flex items-center text-xs mt-1 gap-1 text-gray-500">
                            <MapPin size={12} /> {prop.location}
                          </span>

                          <span className="flex items-center text-xs mt-1 gap-1 text-blue-600 font-bold">
                            <IndianRupee size={12} />{" "}
                            {prop.price?.toLocaleString("en-IN")}
                          </span>

                          <Link
                            href={`/properties/${prop.id}`}
                            className="mt-2 block text-center bg-blue-50 hover:bg-blue-100 text-blue-600 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            View Details
                          </Link>
                        </div>
                      ))}

                      {msg.properties.length > 3 && (
                        <div className="text-center text-xs text-gray-500">
                          + {msg.properties.length - 3} more properties
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-2xl flex space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Smart Buttons */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {smartQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-3 py-1.5 rounded-full"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-gray-100 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-full"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl"
        >
          <MessageCircle size={28} />
        </motion.button>
      )}
    </div>
  );
}