
"use client";

import { useEffect } from "react";

export default function StandaloneWidget() {
  useEffect(() => {
    const widgetId = process.env.NEXT_PUBLIC_SUPPORT_WIDGET_ID;

    if (!widgetId) {
      console.error("The public support widget ID is not configured.");
      return;
    }

    const existingScript = document.querySelector(
      'script[data-standalone-support-widget="true"]'
    );

    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "/widget.js";
    script.async = true;
    script.dataset.widgetId = widgetId;
    script.dataset.position = "right";
    script.dataset.standaloneSupportWidget = "true";

    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelector("[data-support-widget]")?.remove();
    };
  }, []);

  return null;
}
