"use client";

import { useState } from "react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function SupportChat() {
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setInput("");

    try {
      const res = await fetch(
        "/api/support-chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
        },
        {
          role: "assistant",
          content:
            "Sorry, something went wrong.",
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 rounded-full p-3 bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-colors z-50"
      >
        <Image
          src="/supportSVG.svg"
          alt="Support"
          width={40}
          height={40}
        />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-120px)] bg-white border rounded-xl shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b font-semibold text-slate-900">
            AI Support
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                Hi 👋 How can I help you?
              </p>
            )}

            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role ===
                    "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      message.role ===
                      "user"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2 outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}