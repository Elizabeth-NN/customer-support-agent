"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { focusRing } from "@/lib/ui";

type Settings = {
  name: string;
  description: string | null;
  support_email: string | null;
  support_phone: string | null;
  assistant_name: string;
  welcome_message: string;
  fallback_message: string;
  escalate_on_low_confidence: boolean;
};

const initialSettings: Settings = {
  name: "",
  description: "",
  support_email: "",
  support_phone: "",
  assistant_name: "Support Assistant",
  welcome_message: "Hi! How can I help you today?",
  fallback_message:
    "I don't have enough information to answer that question.",
  escalate_on_low_confidence: true,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#292929]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-5 text-[#6B6B6B]">{hint}</p>}
    </div>
  );
}

const inputClass = `${focusRing} w-full rounded-xl border border-[#E5E2DC] bg-white px-3.5 py-3 text-sm text-[#292929] placeholder:text-[#99958E]`;

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#EAE7E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2F0EB] text-[#292929]">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold tracking-tight text-[#292929]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/backend/settings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Your session may have expired. Please sign in again.");
          }

          if (response.status === 404) {
            throw new Error(
              "No business is associated with your account. Set up your business profile first.",
            );
          }

          throw new Error("Unable to load settings. Please try again.");
        }

        const data: Settings = await response.json();

        if (!cancelled) {
          setSettings({
            ...initialSettings,
            ...data,
            description: data.description ?? "",
            support_email: data.support_email ?? "",
            support_phone: data.support_phone ?? "",
          });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading settings.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof Settings>(
    field: K,
    value: Settings[K],
  ) {
    setSettings((current) => ({ ...current, [field]: value }));
    setNotice(null);
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload: Settings = {
        ...settings,
        name: settings.name.trim(),
        description: settings.description?.trim() || null,
        support_email: settings.support_email?.trim() || null,
        support_phone: settings.support_phone?.trim() || null,
        assistant_name: settings.assistant_name.trim(),
        welcome_message: settings.welcome_message.trim(),
        fallback_message: settings.fallback_message.trim(),
      };

      const response = await fetch("/api/backend/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session may have expired. Please sign in again.");
        }

        const result = await response.json().catch(() => null);
        const detail =
          typeof result?.detail === "string" ? result.detail : null;

        throw new Error(detail ?? "Unable to save settings. Please try again.");
      }

      const saved: Settings = await response.json();

      setSettings({
        ...initialSettings,
        ...saved,
        description: saved.description ?? "",
        support_email: saved.support_email ?? "",
        support_phone: saved.support_phone ?? "",
      });
      setNotice("Your settings have been saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6 lg:px-10">
        <p className="text-sm text-[#6B6B6B]">Loading your settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736D]">
          Workspace
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#292929] sm:text-[28px]">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B6B6B]">
          Manage your business profile and customize how your customer support
          assistant communicates with customers.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-[#F2C9C6] bg-[#FCE8E6] p-4 text-sm text-[#A12622]"
        >
          <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-[#B7DFC2] bg-[#E6F4EA] p-4 text-sm text-[#176B35]"
        >
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <Section
          icon={<BuildingOffice2Icon className="h-5 w-5" />}
          title="Business profile"
          description="These details identify your business and help customers know how to contact you."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name">
              <input
                required
                maxLength={255}
                className={inputClass}
                value={settings.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your business name"
              />
            </Field>

            <Field label="Support email">
              <input
                type="email"
                maxLength={320}
                className={inputClass}
                value={settings.support_email ?? ""}
                onChange={(event) =>
                  updateField("support_email", event.target.value)
                }
                placeholder="support@example.com"
              />
            </Field>

            <Field label="Support phone">
              <input
                type="tel"
                maxLength={50}
                className={inputClass}
                value={settings.support_phone ?? ""}
                onChange={(event) =>
                  updateField("support_phone", event.target.value)
                }
                placeholder="+254 7XX XXX XXX"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Business description" hint="A short description of what your business does.">
                <textarea
                  rows={3}
                  maxLength={5000}
                  className={inputClass}
                  value={settings.description ?? ""}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Tell customers what your business offers..."
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section
          icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
          title="Chatbot preferences"
          description="Customize the assistant's identity and the messages it uses in customer conversations."
        >
          <div className="space-y-5">
            <Field label="Assistant name" hint="The name customers will see when chatting with your assistant.">
              <input
                required
                maxLength={100}
                className={inputClass}
                value={settings.assistant_name}
                onChange={(event) =>
                  updateField("assistant_name", event.target.value)
                }
                placeholder="Support Assistant"
              />
            </Field>

            <Field label="Welcome message">
              <textarea
                required
                rows={3}
                maxLength={2000}
                className={inputClass}
                value={settings.welcome_message}
                onChange={(event) =>
                  updateField("welcome_message", event.target.value)
                }
                placeholder="Hi! How can I help you today?"
              />
            </Field>

            <Field
              label="Fallback response"
              hint="Used when the assistant cannot find enough information to answer confidently."
            >
              <textarea
                required
                rows={3}
                maxLength={2000}
                className={inputClass}
                value={settings.fallback_message}
                onChange={(event) =>
                  updateField("fallback_message", event.target.value)
                }
                placeholder="I don't have enough information to answer that question."
              />
            </Field>
          </div>
        </Section>

        <Section
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          title="Escalation preferences"
          description="Choose whether low-confidence questions should be flagged for human support."
        >
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className={`${focusRing} mt-1 h-4 w-4 rounded border-[#C9C5BD] accent-[#292929]`}
              checked={settings.escalate_on_low_confidence}
              onChange={(event) =>
                updateField("escalate_on_low_confidence", event.target.checked)
              }
            />
            <span>
              <span className="block text-sm font-semibold text-[#292929]">
                Escalate questions the assistant cannot confidently answer
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#6B6B6B]">
                When enabled, the assistant should direct unanswered questions
                to your support team instead of guessing.
              </span>
            </span>
          </label>
        </Section>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EAE7E1] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#77736D]">
            Changes are saved to your business profile when you select Save.
          </p>
          <button
            type="submit"
            disabled={saving}
            className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-xl bg-[#292929] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#444] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {saving ? "Saving changes..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
