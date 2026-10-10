
(function () {
  "use strict";

  const script = document.currentScript;
  if (!script) return;

  const widgetId = (script.dataset.widgetId || "").trim();
  const position = script.dataset.position === "left" ? "left" : "right";

  if (!/^[A-Za-z0-9_-]{20,64}$/.test(widgetId)) {
    console.error("Support widget: a valid data-widget-id is required.");
    return;
  }

  const scriptUrl = new URL(script.src, window.location.href);
  const apiBase = scriptUrl.origin;
  const apiPath = "/api/public/" + encodeURIComponent(widgetId);

  const host = document.createElement("div");
  host.setAttribute("data-support-widget", "");
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    button, input { font: inherit; }
    button { cursor: pointer; }
    .launcher {
      position: fixed; bottom: 20px; ${position}: 20px; z-index: 2147483000;
      width: 58px; height: 58px; border: 0; border-radius: 50%;
      background: #171717; color: white; font-size: 25px;
      box-shadow: 0 5px 22px #0003;
    }
    .panel {
      position: fixed; bottom: 90px; ${position}: 20px;
      z-index: 2147483000; display: none; flex-direction: column;
      width: min(370px, calc(100vw - 32px));
      height: min(590px, calc(100dvh - 120px));
      background: #fff; color: #242424; border: 1px solid #e5e5e5;
      border-radius: 18px; overflow: hidden;
      box-shadow: 0 12px 48px #0002;
      font: 14px/1.5 Arial, Helvetica, sans-serif;
    }
    .panel.open { display: flex; }
    .header {
      background: #171717; color: #fff; padding: 16px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
    }
    .heading { min-width: 0; }
    .assistant-name { font-size: 15px; font-weight: 700; }
    .business-name { font-size: 12px; opacity: .75; margin-top: 3px; }
    .close {
      color: #fff; background: transparent; border: 0;
      font-size: 24px; padding: 2px 7px;
    }
    .messages {
      flex: 1; overflow-y: auto; padding: 16px;
      background: #f8f7f4; display: flex; flex-direction: column; gap: 12px;
    }
    .message {
      max-width: 88%; padding: 11px 13px; border-radius: 14px;
      white-space: pre-wrap; overflow-wrap: anywhere;
    }
    .assistant { align-self: flex-start; background: white; border: 1px solid #eee; }
    .user { align-self: flex-end; color: white; background: #171717; }
    .sources { margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee; }
    .sources-title { font-size: 11px; color: #666; font-weight: bold; margin-bottom: 4px; }
    .source { font-size: 11px; color: #666; margin-top: 3px; }
    .notice { font-size: 12px; color: #666; margin-top: 8px; }
    .error { color: #a21b1b; background: #fff0f0; padding: 10px; border-radius: 8px; }
    .composer {
      display: flex; gap: 8px; padding: 12px; border-top: 1px solid #eee;
      background: white;
    }
    .question {
      min-width: 0; flex: 1; border: 1px solid #ddd; border-radius: 10px;
      padding: 11px; outline-offset: 2px; color: #222; background: #fff;
    }
    .send {
      border: 0; border-radius: 10px; padding: 0 14px;
      background: #171717; color: #fff;
    }
    .send:disabled, .question:disabled { opacity: .5; cursor: not-allowed; }
    .status { color: #666; font-size: 12px; }
    @media (max-width: 480px) {
      .panel {
        width: calc(100vw - 20px); right: 10px; left: 10px;
        bottom: 82px; height: min(600px, calc(100dvh - 100px));
      }
      .launcher { bottom: 12px; }
    }
  `;

  const panel = document.createElement("section");
  panel.className = "panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Customer support chat");
  panel.setAttribute("aria-modal", "false");

  const header = document.createElement("header");
  header.className = "header";

  const heading = document.createElement("div");
  heading.className = "heading";

  const assistantName = document.createElement("div");
  assistantName.className = "assistant-name";
  assistantName.textContent = "Support Assistant";

  const businessName = document.createElement("div");
  businessName.className = "business-name";
  businessName.textContent = "Customer Support";

  heading.append(assistantName, businessName);

  const closeButton = document.createElement("button");
  closeButton.className = "close";
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close support chat");
  header.append(heading, closeButton);

  const messages = document.createElement("div");
  messages.className = "messages";
  messages.setAttribute("aria-live", "polite");

  const composer = document.createElement("form");
  composer.className = "composer";

  const input = document.createElement("input");
  input.className = "question";
  input.type = "text";
  input.maxLength = 2000;
  input.placeholder = "Ask us a question...";
  input.setAttribute("aria-label", "Your question");
  input.autocomplete = "off";

  const sendButton = document.createElement("button");
  sendButton.className = "send";
  sendButton.type = "submit";
  sendButton.textContent = "Send";

  composer.append(input, sendButton);
  panel.append(header, messages, composer);

  const launcher = document.createElement("button");
  launcher.className = "launcher";
  launcher.type = "button";
  launcher.textContent = "☏";
  launcher.setAttribute("aria-label", "Open customer support chat");
  launcher.setAttribute("aria-expanded", "false");

  shadow.append(style, panel, launcher);

  let config = null;
  let loading = false;
  let loaded = false;
  let errorBox = null;

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function showError(message) {
    if (!errorBox) {
      errorBox = document.createElement("div");
      errorBox.className = "error";
      messages.appendChild(errorBox);
    }
    errorBox.textContent = message;
    scrollToBottom();
  }

  function clearError() {
    if (errorBox) errorBox.remove();
    errorBox = null;
  }

  function addMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "message " + role;
    bubble.textContent = text;
    messages.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function addSources(bubble, sources) {
    if (!Array.isArray(sources) || !sources.length) return;

    const section = document.createElement("div");
    section.className = "sources";

    const title = document.createElement("div");
    title.className = "sources-title";
    title.textContent = "Sources";
    section.appendChild(title);

    const seen = new Set();
    sources.forEach(function (source) {
      if (!source || typeof source.document_title !== "string") return;
      const name = source.document_title.trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);

      const item = document.createElement("div");
      item.className = "source";
      item.textContent = name;
      section.appendChild(item);
    });

    bubble.appendChild(section);
    scrollToBottom();
  }

  function setOpen(open) {
    panel.classList.toggle("open", open);
    launcher.setAttribute("aria-expanded", String(open));
    launcher.textContent = open ? "×" : "☏";
    launcher.setAttribute(
      "aria-label",
      open ? "Close customer support chat" : "Open customer support chat"
    );
    if (open && !loaded) loadConfig();
    if (open) input.focus();
  }

  async function loadConfig() {
    if (loaded || loading) return;
    loading = true;
    clearError();

    const status = document.createElement("div");
    status.className = "status";
    status.textContent = "Connecting to support...";
    messages.appendChild(status);

    try {
      const response = await fetch(apiBase + apiPath, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "omit"
      });

      if (!response.ok) throw new Error("Unable to load support.");

      config = await response.json();
      assistantName.textContent = config.assistant_name || "Support Assistant";
      businessName.textContent = config.business_name || "Customer Support";

      status.remove();
      addMessage(
        "assistant",
        config.welcome_message || "Hello! How can I help you today?"
      );
      loaded = true;
    } catch {
      status.remove();
      showError("We couldn't connect to support. Please try again.");
    } finally {
      loading = false;
    }
  }

  async function sendQuestion(question) {
    clearError();
    addMessage("user", question);

    const answerBubble = addMessage("assistant", "Thinking...");
    let answer = "";
    let sources = [];
    let escalation = false;
    let buffer = "";

    input.disabled = true;
    sendButton.disabled = true;

    function processLine(line) {
      if (!line.trim()) return;
      const event = JSON.parse(line);
      const type = event.type || event.event || "";

      if (type === "sources" && Array.isArray(event.sources)) {
        sources = event.sources;
        answerBubble.textContent = answer || "Thinking...";
        addSources(answerBubble, sources);
      } else if (type === "token") {
        answer += event.content || event.token || "";
        answerBubble.textContent = answer;
        addSources(answerBubble, sources);
      } else if (type === "escalation") {
        escalation = event.required === true;
      }
    }

    try {
      const response = await fetch(apiBase + apiPath + "/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/x-ndjson, application/json"
        },
        credentials: "omit",
        body: JSON.stringify({ question: question })
      });

      if (!response.ok) {
        let detail = "We couldn't process your question. Please try again.";
        try {
          const data = await response.json();
          if (typeof data.detail === "string") detail = data.detail;
        } catch {}
        throw new Error(detail);
      }

      if (!response.body) throw new Error("The support response was empty.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        lines.forEach(processLine);
      }

      buffer += decoder.decode();
      if (buffer.trim()) processLine(buffer);

      answerBubble.textContent = answer ||
        (escalation
          ? "I couldn't confidently resolve your question. Please contact the support team for further assistance."
          : "I'm sorry, I couldn't generate an answer. Please try again.");

      addSources(answerBubble, sources);

      if (escalation) {
        const notice = document.createElement("div");
        notice.className = "notice";
        notice.textContent =
          "Your question may need help from the support team.";
        answerBubble.appendChild(notice);
      }
    } catch (error) {
      answerBubble.remove();
      showError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
      scrollToBottom();
    }
  }

  launcher.addEventListener("click", function () {
    setOpen(!panel.classList.contains("open"));
  });

  closeButton.addEventListener("click", function () {
    setOpen(false);
  });

  composer.addEventListener("submit", function (event) {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || loading || !loaded || input.disabled) return;
    input.value = "";
    void sendQuestion(question);
  });
})();
