"use client";

import type { ReactNode } from "react";

export default function ChatActionButton({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("rafiki:open-chat"))}
      className={className}
    >
      {children}
    </button>
  );
}
