"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowPathIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { focusRing } from "@/lib/ui";

type TestCase = {
  id: string;
  question: string;
  expected_answer: string;
  expected_source: string | null;
  expected_escalation: boolean;
  created_at: string;
  updated_at: string;
};

type RetrievedSource = {
  document_title?: string;
  source_uri?: string | null;
  source_type?: string;
  content?: string;
  distance?: number;
};

type EvaluationRun = {
  id: string;
  test_case_id: string;
  generated_answer: string;
  retrieved_sources: RetrievedSource[];
  passed: boolean;
  expected_escalation: boolean;
  actual_escalation: boolean;
  duration_ms: number;
  failure_reason: string | null;
  created_at: string;
};

type TestCaseForm = {
  question: string;
  expected_answer: string;
  expected_source: string;
  expected_escalation: boolean;
};

const emptyForm: TestCaseForm = {
  question: "",
  expected_answer: "",
  expected_source: "",
  expected_escalation: false,
};

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // The response may not contain JSON.
  }

  return `Request failed (${response.status}). Please try again.`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Badge({
  passed,
  children,
}: {
  passed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        passed
          ? "bg-[#E6F4EA] text-[#1E8E3E]"
          : "bg-[#FCE8E6] text-[#B3261E]"
      }`}
    >
      {passed ? (
        <CheckCircleIcon className="h-3.5 w-3.5" />
      ) : (
        <XCircleIcon className="h-3.5 w-3.5" />
      )}
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] sm:p-6">
      <p className="text-sm font-medium text-[#6B6B6B]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.04em] tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-sm text-[#777]">{description}</p>
    </section>
  );
}

export default function EvaluationsPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [form, setForm] = useState<TestCaseForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [casesResponse, runsResponse] = await Promise.all([
        fetch("/api/backend/evaluations/test-cases", {
          cache: "no-store",
        }),
        fetch("/api/backend/evaluations/runs", {
          cache: "no-store",
        }),
      ]);

      if (!casesResponse.ok) {
        throw new Error(await getErrorMessage(casesResponse));
      }

      if (!runsResponse.ok) {
        throw new Error(await getErrorMessage(runsResponse));
      }

      const [casesData, runsData] = await Promise.all([
        casesResponse.json(),
        runsResponse.json(),
      ]);

      setTestCases(casesData as TestCase[]);
      setRuns(runsData as EvaluationRun[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load evaluation data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  async function createTestCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/backend/evaluations/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: form.question.trim(),
          expected_answer: form.expected_answer.trim(),
          expected_source: form.expected_source.trim() || null,
          expected_escalation: form.expected_escalation,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setForm(emptyForm);
      setShowForm(false);
      setNotice("Evaluation test case created.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create test case.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestCase(testCase: TestCase) {
    const confirmed = window.confirm(
      `Delete this test case?\n\n${testCase.question}\n\nIts associated evaluation history will also be deleted.`,
    );

    if (!confirmed) return;

    setDeletingId(testCase.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/backend/evaluations/test-cases/${testCase.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setNotice("Test case and its associated history deleted.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete test case.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function runEvaluations() {
    if (testCases.length === 0) {
      setError("Create at least one test case before running evaluations.");
      return;
    }

    setRunning(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/backend/evaluations/run", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const results = (await response.json()) as EvaluationRun[];
      const passed = results.filter((result) => result.passed).length;

      setNotice(
        `Evaluation complete: ${passed} of ${results.length} test cases passed.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to run evaluations.",
      );
    } finally {
      setRunning(false);
    }
  }

  const latestRun = runs[0] ?? null;
  const latestBatch = latestRun
    ? runs.filter((run) => run.created_at === latestRun.created_at)
    : [];
  const latestBatchPassed = latestBatch.filter((run) => run.passed).length;
  const latestPassRate =
    latestBatch.length > 0
      ? `${Math.round((latestBatchPassed / latestBatch.length) * 100)}%`
      : "—";
  const failedCount = latestBatch.filter((run) => !run.passed).length;
  const averageDuration =
    latestBatch.length > 0
      ? Math.round(
          latestBatch.reduce((sum, run) => sum + run.duration_ms, 0) /
            latestBatch.length,
        )
      : null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#656565]">
            <BeakerIcon className="h-5 w-5" />
            QUALITY ASSURANCE
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
            Evaluations
          </h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-[#6B6B6B]">
            Test your knowledge retrieval, answer generation, source accuracy,
            and escalation behavior.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || running}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[#F9F9F9] disabled:opacity-50 ${focusRing}`}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError(null);
              setNotice(null);
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-[#F9F9F9] ${focusRing}`}
          >
            <PlusIcon className="h-4 w-4" />
            Add test case
          </button>
          <button
            type="button"
            onClick={() => void runEvaluations()}
            disabled={running || loading || testCases.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            <PlayIcon className="h-4 w-4" />
            {running ? "Running tests..." : "Run evaluations"}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-xl border border-[#F1C6C3] bg-[#FCE8E6] p-4 text-sm text-[#8B1E18] sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className={`w-fit rounded-lg bg-white px-3 py-2 font-semibold ${focusRing}`}
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[#B7DEC2] bg-[#E6F4EA] p-4 text-sm text-[#176B32]"
        >
          {notice}
        </div>
      )}

      {showForm && (
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">New evaluation test case</h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Define the question, what a good answer should contain, and
              whether the system should escalate it.
            </p>
          </div>

          <form onSubmit={createTestCase} className="space-y-5">
            <div>
              <label
                htmlFor="question"
                className="mb-1.5 block text-sm font-semibold"
              >
                Customer question
              </label>
              <textarea
                id="question"
                required
                minLength={1}
                maxLength={2000}
                rows={2}
                value={form.question}
                onChange={(event) =>
                  setForm({ ...form, question: event.target.value })
                }
                placeholder="How can I track my order?"
                className={`w-full rounded-xl border border-[#DEDEDE] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-black ${focusRing}`}
              />
            </div>

            <div>
              <label
                htmlFor="expected-answer"
                className="mb-1.5 block text-sm font-semibold"
              >
                Expected answer
              </label>
              <textarea
                id="expected-answer"
                required
                minLength={1}
                maxLength={5000}
                rows={3}
                value={form.expected_answer}
                onChange={(event) =>
                  setForm({ ...form, expected_answer: event.target.value })
                }
                placeholder="Customers can track orders using their order number."
                className={`w-full rounded-xl border border-[#DEDEDE] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-black ${focusRing}`}
              />
              <p className="mt-1.5 text-xs text-[#777]">
                The initial evaluator uses expected-answer term coverage as a
                heuristic, not a full semantic correctness check.
              </p>
            </div>

            <div>
              <label
                htmlFor="expected-source"
                className="mb-1.5 block text-sm font-semibold"
              >
                Expected source document
                <span className="ml-1 font-normal text-[#777]">
                  (optional)
                </span>
              </label>
              <input
                id="expected-source"
                type="text"
                maxLength={500}
                value={form.expected_source}
                onChange={(event) =>
                  setForm({ ...form, expected_source: event.target.value })
                }
                placeholder="Order Tracking Guide"
                className={`w-full rounded-xl border border-[#DEDEDE] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-black ${focusRing}`}
              />
              <p className="mt-1.5 text-xs text-[#777]">
                Match against a retrieved document title or source URL.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E5E5] p-4">
              <input
                type="checkbox"
                checked={form.expected_escalation}
                onChange={(event) =>
                  setForm({
                    ...form,
                    expected_escalation: event.target.checked,
                  })
                }
                className="mt-0.5 h-4 w-4 accent-black"
              />
              <span>
                <span className="block text-sm font-semibold">
                  Escalation is expected
                </span>
                <span className="mt-1 block text-sm text-[#6B6B6B]">
                  Enable for questions the knowledge base should not be able to
                  answer confidently.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className={`rounded-[10px] border border-[#DEDEDE] px-4 py-2.5 text-sm font-semibold hover:bg-[#F8F8F8] ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#292929] disabled:opacity-50 ${focusRing}`}
              >
                {saving ? "Saving..." : "Save test case"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Test cases"
          value={loading ? "—" : String(testCases.length)}
          description="Saved evaluation scenarios"
        />
        <MetricCard
          label="Latest pass rate"
          value={loading ? "—" : latestPassRate}
          description={
            latestBatch.length
              ? `${latestBatchPassed} of ${latestBatch.length} in the latest run`
              : "No evaluation results yet"
          }
        />
        <MetricCard
          label="Latest failures"
          value={loading ? "—" : String(failedCount)}
          description="Failed cases in the latest run"
        />
        <MetricCard
          label="Average duration"
          value={
            loading
              ? "—"
              : averageDuration === null
                ? "—"
                : `${averageDuration} ms`
          }
          description="Average for the latest run"
        />
      </div>

      <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-2 border-b border-[#EEEEEE] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold">Test cases</h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Your saved questions and expected system behavior.
            </p>
          </div>
          <span className="text-sm text-[#777]">
            {testCases.length} {testCases.length === 1 ? "case" : "cases"}
          </span>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-[#777]">
            Loading evaluation data...
          </p>
        ) : testCases.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BeakerIcon className="mx-auto h-9 w-9 text-[#999]" />
            <h3 className="mt-3 font-semibold">No test cases yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-[#777]">
              Add a few realistic customer questions to check whether your RAG
              pipeline retrieves the right sources and answers reliably.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={`mt-5 inline-flex items-center gap-2 rounded-[10px] bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#292929] ${focusRing}`}
            >
              <PlusIcon className="h-4 w-4" />
              Create your first test case
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EEEEEE]">
            {testCases.map((testCase) => (
              <article
                key={testCase.id}
                className="flex flex-col gap-4 px-5 py-5 sm:px-6 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-relaxed">
                    {testCase.question}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#555]">
                    <span className="font-semibold text-[#333]">
                      Expected answer:{" "}
                    </span>
                    {testCase.expected_answer}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F2F0EB] px-2.5 py-1 text-xs font-medium text-[#555]">
                      {testCase.expected_escalation
                        ? "Escalation expected"
                        : "Answer expected"}
                    </span>
                    {testCase.expected_source && (
                      <span className="rounded-full bg-[#F2F0EB] px-2.5 py-1 text-xs font-medium text-[#555]">
                        Source: {testCase.expected_source}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteTestCase(testCase)}
                  disabled={deletingId === testCase.id || running}
                  aria-label={`Delete test case: ${testCase.question}`}
                  className={`inline-flex w-fit items-center gap-2 rounded-lg border border-[#E7C9C7] px-3 py-2 text-sm font-semibold text-[#A12620] transition hover:bg-[#FCE8E6] disabled:opacity-50 ${focusRing}`}
                >
                  <TrashIcon className="h-4 w-4" />
                  {deletingId === testCase.id ? "Deleting..." : "Delete"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="border-b border-[#EEEEEE] px-5 py-5 sm:px-6">
          <h2 className="text-lg font-bold">Evaluation history</h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Recent individual test results, including retrieved evidence and
            failure reasons.
          </p>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-[#777]">
            Loading evaluation history...
          </p>
        ) : runs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClockIcon className="mx-auto h-9 w-9 text-[#999]" />
            <h3 className="mt-3 font-semibold">No evaluation runs yet</h3>
            <p className="mt-1 text-sm text-[#777]">
              Your results will appear here after your first run.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EEEEEE]">
            {runs.map((run) => {
              const testCase = testCases.find(
                (item) => item.id === run.test_case_id,
              );

              return (
                <details key={run.id} className="group px-5 py-5 sm:px-6">
                  <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge passed={run.passed}>
                          {run.passed ? "Passed" : "Failed"}
                        </Badge>
                        <span className="text-xs text-[#777]">
                          {formatDate(run.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 font-semibold leading-relaxed">
                        {testCase?.question ?? "Test case no longer available"}
                      </p>
                      <p className="mt-1 text-sm text-[#777]">
                        {run.duration_ms} ms
                        {" · "}
                        {run.actual_escalation
                          ? "Escalation triggered"
                          : "No escalation"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#555] group-open:hidden">
                      View details +
                    </span>
                    <span className="hidden text-sm font-semibold text-[#555] group-open:inline">
                      Hide details −
                    </span>
                  </summary>

                  <div className="mt-5 grid gap-4 border-t border-[#EEEEEE] pt-5 lg:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold">Generated answer</h4>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#F7F6F3] p-4 text-sm leading-relaxed text-[#444]">
                        {run.generated_answer}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold">Evaluation checks</h4>
                      <dl className="mt-2 space-y-2 rounded-xl bg-[#F7F6F3] p-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#666]">Expected escalation</dt>
                          <dd className="font-medium">
                            {run.expected_escalation ? "Yes" : "No"}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-[#666]">Actual escalation</dt>
                          <dd className="font-medium">
                            {run.actual_escalation ? "Yes" : "No"}
                          </dd>
                        </div>
                      </dl>
                      {run.failure_reason && (
                        <div className="mt-3 rounded-xl border border-[#F1C6C3] bg-[#FCE8E6] p-4 text-sm leading-relaxed text-[#8B1E18]">
                          <p className="font-semibold">Failure reason</p>
                          <p className="mt-1">{run.failure_reason}</p>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-semibold">
                        Retrieved sources ({run.retrieved_sources.length})
                      </h4>
                      {run.retrieved_sources.length === 0 ? (
                        <p className="mt-2 text-sm text-[#777]">
                          No sources were retrieved for this run.
                        </p>
                      ) : (
                        <div className="mt-2 grid gap-3 md:grid-cols-2">
                          {run.retrieved_sources.map((source, index) => (
                            <div
                              key={`${run.id}-${index}`}
                              className="rounded-xl border border-[#EAEAEA] p-4"
                            >
                              <p className="text-sm font-semibold">
                                {source.document_title || `Source ${index + 1}`}
                              </p>
                              {source.source_uri && (
                                <p className="mt-1 break-all text-xs text-[#666]">
                                  {source.source_uri}
                                </p>
                              )}
                              {source.distance !== undefined && (
                                <p className="mt-2 text-xs text-[#777]">
                                  Retrieval distance:{" "}
                                  {source.distance.toFixed(4)}
                                </p>
                              )}
                              {source.content && (
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#555]">
                                  {source.content}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-5 text-xs leading-relaxed text-[#777]">
        Answer matching currently uses a lexical coverage heuristic. Passing a
        test is a useful initial signal, not a guarantee of semantic accuracy.
      </p>
    </div>
  );
}
