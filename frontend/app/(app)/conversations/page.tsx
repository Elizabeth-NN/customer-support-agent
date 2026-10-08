"use client";

import { FormEvent, useState } from "react";

type Message = {
id: number;
role: "user" | "assistant";
content: string;
};

export default function ConversationsPage() {
const [messages, setMessages] = useState<Message[]>([
{
id: 1,
role: "assistant",
content:
"Hi! I'm your AI support assistant. Ask me a question about your business knowledge.",
},
]);

const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
null,
);
const [question, setQuestion] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


const trimmedQuestion = question.trim();

if (!trimmedQuestion || isLoading) {
  return;
}

setError("");

const userMessage: Message = {
  id: Date.now(),
  role: "user",
  content: trimmedQuestion,
};

const assistantMessageId = Date.now() + 1;

setMessages((current) => [
  ...current,
  userMessage,
  {
    id: assistantMessageId,
    role: "assistant",
    content: "",
  },
]);

setStreamingMessageId(assistantMessageId);
setQuestion("");
setIsLoading(true);

try {
  const response = await fetch("/api/backend/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: trimmedQuestion,
    }),
  });

  if (!response.ok) {
    let message = "Something went wrong while contacting the assistant.";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("The assistant returned an empty response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let assistantContent = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    assistantContent += chunk;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              content: assistantContent,
            }
          : message,
      ),
    );
  }

  const finalChunk = decoder.decode();

  if (finalChunk) {
    assistantContent += finalChunk;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              content: assistantContent,
            }
          : message,
      ),
    );
  }
} catch (err) {
  setMessages((current) =>
    current.filter((message) => message.id !== assistantMessageId),
  );

  setError(
    err instanceof Error
      ? err.message
      : "Something went wrong while contacting the assistant.",
  );
} finally {
  setStreamingMessageId(null);
  setIsLoading(false);
}


}

return ( <div className="flex min-h-[calc(100vh-1px)] flex-col"> <header className="border-b border-black/[0.06] px-6 py-6 md:px-8"> <div className="mx-auto max-w-5xl"> <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
AI Support </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        Conversations
      </h1>

      <p className="mt-2 text-sm text-stone-500">
        Ask questions and get answers grounded in your business knowledge.
      </p>
    </div>
  </header>

  <main className="flex flex-1 px-4 py-6 md:px-8">
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
      <div className="flex-1 space-y-6 overflow-y-auto p-5 md:p-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 md:max-w-[70%] ${
                message.role === "user"
                  ? "bg-black text-white"
                  : "bg-[#F2F0EB] text-[#141414]"
              }`}
            >
              {message.content}

              {message.role === "assistant" &&
                isLoading &&
                message.id === streamingMessageId && (
                  <span className="ml-1 inline-block animate-pulse">
                    ▍
                  </span>
                )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-black/[0.06] bg-white p-4 md:p-5"
      >
        <div className="flex gap-3">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about your business knowledge..."
            disabled={isLoading}
            maxLength={2000}
            className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-[#F2F0EB] px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {isLoading ? "Generating..." : "Send"}
          </button>
        </div>

        <div className="mt-2 text-right text-xs text-stone-400">
          {question.length}/2000
        </div>
      </form>
    </div>
  </main>
</div>


);
}
