"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I’m your Pawtine assistant. Ask me about feeding schedules, walk reminders, or how to use the app.",
  },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data?.message ?? "I had trouble forming a response just now.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat request failed", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Looks like I’m having connection issues. Can you try again later?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="fixed bottom-8 right-8 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-paw-primary text-3xl text-white shadow-lg transition hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-paw-secondary/60"
        >
          💬
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-8 right-8 flex h-96 w-80 flex-col rounded-3xl border border-slate-200 bg-white shadow-xl shadow-paw-primary/20">
          <header className="flex items-center justify-between rounded-t-3xl bg-paw-primary px-4 py-3 text-white shadow">
            <div>
              <p className="text-sm font-semibold">Pawtine Assistant</p>
              <p className="text-xs text-paw-secondary/80">Here to help with routines</p>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold"
            >
              Close
            </button>
          </header>

          <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "assistant"
                    ? "mr-auto max-w-[85%] rounded-2xl bg-paw-secondary/20 px-3 py-2 text-paw-primary"
                    : "ml-auto max-w-[85%] rounded-2xl bg-paw-primary px-3 py-2 text-white"
                }
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[85%] rounded-2xl bg-paw-secondary/20 px-3 py-2 text-paw-primary">
                Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about walks, feeding, etc."
                className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-paw-primary focus:outline-none focus:ring-2 focus:ring-paw-primary/40"
                disabled={isLoading}
              />
              <button type="submit" className="btn" disabled={isLoading}>
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
