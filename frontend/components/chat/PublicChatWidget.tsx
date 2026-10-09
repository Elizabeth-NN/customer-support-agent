
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Source = {
  document_title: string;
  source_type?: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  escalation?: boolean;
};

type WidgetConfig = {
  business_name: string;
  assistant_name: string;
  welcome_message: string;
};

const widgetId = process.env.NEXT_PUBLIC_SUPPORT_WIDGET_ID;

export default function PublicChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

 
  useEffect(() => {
    if (!widgetId || !isOpen || config) return;

    let cancelled = false;

    async function loadConfig() {
      setLoadingConfig(true);
      setError("");

      try {
        const response = await fetch(
          `/api/public/${encodeURIComponent(widgetId!)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Unable to load the support assistant.");
        }

        const data = (await response.json()) as WidgetConfig;

        if (cancelled) return;

        setConfig(data);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              data.welcome_message ||
              "Hello! How can I help you today?",
          },
        ]);
      } catch {
        if (!cancelled) {
          setError(
            "We couldn't connect to support. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, [isOpen, config]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && config && !sending) {
      inputRef.current?.focus();
    }
  }, [isOpen, config, sending]);

  if (!widgetId) return null;

  const publicWidgetId = widgetId;

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = question.trim();

    if (!text || sending || !config) return;

    setQuestion("");
    setError("");
    setSending(true);

    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      { id: userId, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    let answer = "";
    let receivedSources: Source[] = [];
    let escalationRequired = false;
    let receivedDone = false;
    let buffer = "";

    const updateAssistant = (updates: Partial<Message>) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? { ...message, ...updates }
            : message,
        ),
      );
    };

    try {
      const response = await fetch(
        `/api/public/${encodeURIComponent(publicWidgetId)}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        },
      );

      if (!response.ok) {
        let detail = "We couldn't process your question.";

        try {
          const data = await response.json();
          if (typeof data.detail === "string") detail = data.detail;
        } catch {
          // Keep the default message if the response isn't JSON.
        }

        throw new Error(detail);
      }

      if (!response.body) {
        throw new Error("The support response was empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const processLine = (line: string) => {
        if (!line.trim()) return;

        const event = JSON.parse(line) as {
          type?: string;
          event?: string;
          content?: string;
          token?: string;
          sources?: Source[];
          required?: boolean;
          ticket_created?: boolean;
        };

        const type = event.type ?? event.event ?? "";

        if (type === "sources" && Array.isArray(event.sources)) {
          receivedSources = event.sources;
          updateAssistant({ sources: receivedSources });
        }

        if (type === "token") {
          const token = event.content ?? event.token ?? "";
          answer += token;
          updateAssistant({
            content: answer,
            sources: receivedSources,
          });
        }

        if (type === "escalation") {
          escalationRequired = event.required === true;
          updateAssistant({ escalation: escalationRequired });
        }

        if (type === "done") {
          receivedDone = true;
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          processLine(line);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processLine(buffer);
      }

      if (!answer.trim()) {
        answer = escalationRequired
          ? "I couldn't confidently resolve your question. Please contact our support team for further assistance."
          : "I'm sorry, I couldn't generate an answer. Please try again.";
      }

      updateAssistant({
        content: answer,
        sources: receivedSources,
        escalation: escalationRequired,
      });

      if (!receivedDone) {
        // The stream may end without a final event; keep any answer received.
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setMessages((current) =>
        current.filter((item) => item.id !== assistantId),
      );
      setError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <section
          aria-label="Customer support chat"
          role="dialog"
          aria-modal="false"
          className="mb-4 flex h-[min(600px,75vh)] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-black px-5 py-4 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {config?.assistant_name || "Support Assistant"}
              </p>
              <p className="mt-1 truncate text-xs text-white/70">
                {config?.business_name || "Customer Support"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="ml-3 rounded-full p-2 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-[#f8f7f4] p-4"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {loadingConfig && (
              <p className="text-sm text-gray-500">
                Connecting to support...
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-br-sm bg-black text-white"
                      : "rounded-bl-sm border border-black/5 bg-white text-gray-800"
                  }`}
                >
                  {message.content ? (
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  ) : sending && message.role === "assistant" ? (
                    <p className="text-gray-500">Thinking...</p>
                  ) : null}

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 border-t border-black/10 pt-2">
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        Sources
                      </p>
                      <ul className="space-y-1">
                        {[...new Map(
                          message.sources.map((source) => [
                            source.document_title.trim().toLowerCase(),
                            source,
                          ]),
                        ).values()].map((source) => (
                          <li
                            key={source.document_title.trim().toLowerCase()}
                            className="break-words text-xs text-gray-600"
                          >
                            {source.document_title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message.escalation && (
                    <p className="mt-2 text-xs text-gray-500">
                      Your question may need help from our support team.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    if (!config) {
                      setLoadingConfig(false);
                    }
                  }}
                  className="ml-2 font-semibold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t border-black/10 bg-white p-3"
          >
            <input
              ref={inputRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask us a question..."
              aria-label="Your question"
              disabled={!config || sending}
              maxLength={4000}
              className="min-w-0 flex-1 rounded-xl border border-black/10 bg-gray-50 px-3 py-3 text-sm outline-none transition focus:border-black disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!question.trim() || !config || sending}
              aria-label="Send message"
              className="rounded-xl bg-black p-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition hover:scale-105 hover:bg-gray-800"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
