"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type KnowledgeDocument = {
  id: string;
  business_id: string;
  title: string;
  source_type: string;
  source_uri: string | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
};

type UploadResponse = {
  document_id: string;
  chunk_count: number;
  filename: string;
  content_type: string;
};

const ACCEPTED_FILE_TYPES =
  ".txt,.md,.markdown,.pdf,.docx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] =
    useState<UploadResponse | null>(null);
  const [error, setError] = useState("");

  async function loadDocuments(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/backend/documents", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Unable to load documents.",
        );
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load documents.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

    useEffect(() => {
    let cancelled = false;

    async function loadInitialDocuments() {
      setError("");

      try {
        const response = await fetch("/api/backend/documents", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.detail || "Unable to load documents.",
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setDocuments(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load documents.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setError("");
    setUploadResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("File size cannot exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      const filenameWithoutExtension = file.name.replace(
        /\.[^/.]+$/,
        "",
      );

      setTitle(filenameWithoutExtension);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setUploadResult(null);

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a document to upload.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size cannot exceed 10 MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("file", selectedFile);

      const response = await fetch("/api/backend/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to upload document.",
        );
      }

      setUploadResult(data);
      setTitle("");
      setSelectedFile(null);

      const fileInput = document.getElementById(
        "document-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload document.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handlePublicationToggle(document: KnowledgeDocument) {
    const nextPublishedState = !document.is_published;
    setError("");
    setPublishingId(document.id);

    try {
      const response = await fetch(
        `/api/backend/documents/${document.id}/publication`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: nextPublishedState }),
        },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Unable to update publication status.");
      }

      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? { ...item, is_published: nextPublishedState }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update publication status.",
      );
    } finally {
      setPublishingId(null);
    }
  }

  async function handleDelete(document: KnowledgeDocument) {
    const confirmed = window.confirm(
      `Remove "${document.title}" from the knowledge base?\n\nThis will also remove its knowledge chunks.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setUploadResult(null);
    setDeletingId(document.id);

    try {
      const response = await fetch(
        `/api/backend/documents/${document.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to remove document.",
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (currentDocument) => currentDocument.id !== document.id,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove document.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-KE", {
      dateStyle: "medium",
    }).format(date);
  }

  function formatSourceType(sourceType: string) {
    return sourceType
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <section className="min-h-screen px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="dashboard-header mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#777]">
            <DocumentTextIcon className="h-4 w-4" />
            Knowledge Base
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Documents
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b6b6b]">
                Upload the documents your support agent should use
                when answering customer questions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDocuments(true)}
              disabled={refreshing || loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="dashboard-card h-fit rounded-[18px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold tracking-[-0.02em]">
                Add a document
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#777]">
                Supported: TXT, Markdown, PDF, and DOCX. Maximum
                file size is 10 MB.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label
                  htmlFor="document-title"
                  className="mb-2 block text-sm font-semibold"
                >
                  Document title
                </label>

                <input
                  id="document-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                    setUploadResult(null);
                  }}
                  placeholder="Customer Support FAQ"
                  disabled={uploading}
                  className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#aaa] focus:border-black/30 focus:bg-white focus:ring-2 focus:ring-black/5 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="document-file"
                  className="mb-2 block text-sm font-semibold"
                >
                  File
                </label>

                <label
                  htmlFor="document-file"
                  className="flex min-h-[104px] cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/15 bg-[#fafafa] px-4 py-4 text-left transition hover:border-black/30 hover:bg-white"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f0eb]">
                    <ArrowUpTrayIcon className="h-5 w-5 text-[#555]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {selectedFile
                        ? selectedFile.name
                        : "Choose a document"}
                    </span>

                    <span className="mt-0.5 block text-xs text-[#888]">
                      TXT, MD, PDF, DOCX · Up to 10 MB
                    </span>
                  </div>

                  <span className="shrink-0 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#444]">
                    Browse
                  </span>

                  <input
                    id="document-file"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
              </div>

              {error && (
                <div className="flex gap-2 rounded-xl border border-[#d93025]/15 bg-[#fce8e6] p-3 text-sm text-[#b3261e]">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {uploadResult && (
                <div className="rounded-xl border border-[#1e8e3e]/15 bg-[#e6f4ea] p-3 text-sm text-[#176b2c]">
                  <p className="font-semibold">
                    Document uploaded successfully.
                  </p>
                  <p className="mt-1">
                    {uploadResult.chunk_count} knowledge chunks
                    were created.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Processing document...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Upload document
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="dashboard-card rounded-[18px] border border-black/[0.06] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold tracking-[-0.02em]">
                  Knowledge documents
                </h2>

                <p className="mt-1 text-sm text-[#777]">
                  {documents.length}{" "}
                  {documents.length === 1
                    ? "document"
                    : "documents"}{" "}
                  available to the agent.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-60 items-center justify-center px-6">
                <div className="flex items-center gap-2 text-sm text-[#777]">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Loading documents...
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 rounded-full bg-[#f2f0eb] p-3">
                  <DocumentTextIcon className="h-6 w-6 text-[#666]" />
                </div>

                <h3 className="text-sm font-bold">
                  No documents yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-5 text-[#777]">
                  Upload your first FAQ, policy, manual, or other
                  support document to start building the knowledge
                  base.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-3 px-5 py-5 sm:px-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-[#f2f0eb] p-2">
                        <DocumentTextIcon className="h-5 w-5 text-[#444]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold">
                          {document.title}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#888]">
                          <span>
                            {formatSourceType(document.source_type)}
                          </span>

                          <span aria-hidden="true">·</span>

                          <span>
                            Added {formatDate(document.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            document.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {document.is_published ? "Published" : "Unpublished"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePublicationToggle(document)}
                          disabled={publishingId === document.id}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            document.is_published
                              ? "border border-black/10 text-[#555] hover:bg-black/5"
                              : "bg-[#166534] text-white hover:bg-[#14532d]"
                          }`}
                        >
                          {publishingId === document.id
                            ? "Saving..."
                            : document.is_published
                              ? "Unpublish"
                              : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(document)}
                          disabled={deletingId === document.id}
                          aria-label={`Remove ${document.title}`}
                          title="Remove document"
                          className="rounded-lg p-2 text-[#888] transition hover:bg-[#fce8e6] hover:text-[#d93025] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <TrashIcon
                            className={`h-4 w-4 ${
                              deletingId === document.id ? "animate-pulse" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {document.source_uri && (
                      <p className="truncate pl-11 text-xs text-[#999]">
                        {document.source_uri}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
