"use client";

import { FormEvent, useState } from "react";

type Citation = {
  document_id: string;
  document_title: string;
  source_type: string;
  source_uri: string | null;
  chunk_id: string;
  chunk_index: number;
  distance: number;
  content: string;
};

type Message = {
id: number;
role: "user" | "assistant";
content: string;
citations?: Citation[];
};

type StreamEvent =
| {
type: "sources";
sources: Citation[];
}
| {
type: "token";
content: string;
}
| {
type: "done";
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
    citations: [],
  },
]);

setQuestion("");
setIsLoading(true);
setStreamingMessageId(assistantMessageId);

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

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");

    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      let event: StreamEvent;

      try {
        event = JSON.parse(line) as StreamEvent;
      } catch {
        continue;
      }

      if (event.type === "sources") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  citations: event.sources,
                }
              : message,
          ),
        );
      }

      if (event.type === "token") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: message.content + event.content,
                }
              : message,
          ),
        );
      }
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    try {
      const event = JSON.parse(buffer) as StreamEvent;

      if (event.type === "sources") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  citations: event.sources,
                }
              : message,
          ),
        );
      }

      if (event.type === "token") {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: message.content + event.content,
                }
              : message,
          ),
        );
      }
    } catch {
      // Ignore incomplete or invalid trailing data.
    }
  }
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Something went wrong while contacting the assistant.",
  );

  setMessages((current) =>
    current.filter((message) => message.id !== assistantMessageId),
  );
} finally {
  setIsLoading(false);
  setStreamingMessageId(null);
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
              className={`max-w-[85%] md:max-w-[70%] ${
                message.role === "user"
                  ? "rounded-2xl bg-black px-4 py-3 text-sm leading-6 text-white"
                  : "text-sm leading-6 text-[#141414]"
              }`}
            >
              {message.role === "user" ? (
                <div className="rounded-2xl bg-black px-4 py-3">
                  {message.content}
                </div>
              ) : (
                <>
                  <div className="rounded-2xl bg-[#F2F0EB] px-4 py-3">
                    {message.content}

                    {streamingMessageId === message.id && (
                      <span className="ml-1 inline-block animate-pulse">
                        ▍
                      </span>
                    )}
                  </div>

                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3">
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                          Sources
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          Based on {message.citations.length}{" "}
                          {message.citations.length === 1
                            ? "knowledge source"
                            : "knowledge sources"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {message.citations.map((citation, index) => {
                          const similarity = Math.max(0, 1 - citation.distance);

                          const citationContent = (
                            <div className="flex items-start gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[10px] font-semibold text-stone-600">
                                {index + 1}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="text-xs font-semibold text-stone-800">
                                    {citation.document_title}
                                  </p>

                                  {citation.source_uri && (
                                    <span className="shrink-0 text-[11px] font-medium text-stone-400">
                                      View source →
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-stone-400">
                                  <span>{citation.source_type}</span>

                                  <span aria-hidden="true">·</span>

                                  <span>
                                    Chunk {citation.chunk_index + 1}
                                  </span>

                                  <span aria-hidden="true">·</span>

                                  <span>Similarity {similarity.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );

                          if (citation.source_uri) {
                            return (
                              <a
                                key={citation.chunk_id}
                                href={citation.source_uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg border border-stone-100 bg-stone-50 px-3 py-2.5 transition hover:border-stone-300 hover:bg-stone-100"
                              >
                                {citationContent}
                              </a>
                            );
                          }

                          return (
                            <div
                              key={citation.chunk_id}
                              className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-2.5"
                            >
                              {citationContent}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
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
