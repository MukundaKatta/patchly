"use client";

import { useState } from "react";
import Link from "next/link";

interface ReviewComment {
  file: string;
  line: number;
  severity: "bug" | "warning" | "nit";
  title: string;
  suggestion: string;
}

interface PatternMatch {
  pattern: RegExp;
  extract: (diff: string, match: RegExpMatchArray) => ReviewComment;
}

const PATTERNS: PatternMatch[] = [
  {
    pattern: /^\+.*(?:=\s*await\s+\S+\.find\w*\(|=\s*\w+\.get\w*\()(?!.*(?:if\s*\(|throw|\?\?))/m,
    extract: (_diff, match) => {
      const lines = _diff.slice(0, match.index).split("\n");
      const file = extractFile(_diff) ?? "unknown.ts";
      return {
        file,
        line: lines.length,
        severity: "bug",
        title: "Null check missing after lookup",
        suggestion:
          "Add a guard clause — if the result is undefined, throw a descriptive error instead of letting it crash downstream.",
      };
    },
  },
  {
    pattern: /^\+.*console\.(log|warn|error|debug|info)\s*\(/m,
    extract: (_diff, match) => {
      const lines = _diff.slice(0, match.index).split("\n");
      const file = extractFile(_diff) ?? "unknown.ts";
      return {
        file,
        line: lines.length,
        severity: "warning",
        title: "Console statement left in code",
        suggestion:
          "Remove this console call before merging, or replace it with a structured logger if you need observability.",
      };
    },
  },
  {
    pattern: /^\+.*(?:\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK|\/\/\s*XXX)/im,
    extract: (_diff, match) => {
      const lines = _diff.slice(0, match.index).split("\n");
      const file = extractFile(_diff) ?? "unknown.ts";
      return {
        file,
        line: lines.length,
        severity: "nit",
        title: "TODO comment introduced in new code",
        suggestion:
          "Track this in your issue tracker instead of leaving a comment. TODOs in code tend to stay forever.",
      };
    },
  },
];

function extractFile(diff: string): string | null {
  const match = diff.match(/^\+\+\+\s+b\/(.+)/m);
  return match ? match[1] : null;
}

const SAMPLE_DIFF = `--- a/src/handlers/user.ts
+++ b/src/handlers/user.ts
@@ -12,6 +12,9 @@
 export async function getUser(id: string) {
-  const user = await db.findUser(id);
+  const user = await db.findUser(id);
+  // TODO: add caching here
+  console.log("fetched user", user);
   return { name: user.name, email: user.email };
 }`;

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bug: { bg: "bg-red-50", text: "text-red-900", label: "Bug" },
  warning: { bg: "bg-amber-50", text: "text-amber-900", label: "Warning" },
  nit: { bg: "bg-blue-50", text: "text-blue-900", label: "Nit" },
};

export default function TryPage() {
  const [diff, setDiff] = useState("");
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [reviewed, setReviewed] = useState(false);

  function handleReview() {
    const input = diff.trim();
    if (!input) return;

    const results: ReviewComment[] = [];
    for (const { pattern, extract } of PATTERNS) {
      const match = input.match(pattern);
      if (match) {
        results.push(extract(input, match));
      }
    }

    if (results.length === 0) {
      results.push({
        file: extractFile(input) ?? "unknown file",
        line: 1,
        severity: "nit",
        title: "No common issues detected",
        suggestion:
          "This diff looks clean based on our pattern checks. The full product uses deeper static analysis.",
      });
    }

    setComments(results);
    setReviewed(true);
  }

  function handleReset() {
    setDiff("");
    setComments([]);
    setReviewed(false);
  }

  function handleLoadSample() {
    setDiff(SAMPLE_DIFF);
    setComments([]);
    setReviewed(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-500" />
          Patchly
        </Link>
        <Link
          href="/#waitlist"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Get early access
        </Link>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-600">
            Diff review
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Paste a diff, get instant feedback.
          </h1>
        </div>

        {!reviewed ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Unified diff
            </label>
            <textarea
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              placeholder="Paste a unified diff here..."
              rows={14}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 resize-y"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleReview}
                disabled={!diff.trim()}
                className="rounded-full bg-neutral-900 px-7 py-3.5 font-medium text-white transition hover:bg-neutral-700 disabled:opacity-40"
              >
                Review
              </button>
              <button
                onClick={handleLoadSample}
                className="rounded-full border border-neutral-300 px-7 py-3.5 font-medium text-neutral-900 transition hover:border-neutral-900"
              >
                Load sample diff
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-600">
                Input diff
              </div>
              <pre className="rounded-xl bg-neutral-900 p-4 font-mono text-xs text-neutral-100 overflow-x-auto whitespace-pre-wrap">
                {diff}
              </pre>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-600">
                Patchly found {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-3">
                {comments.map((c, i) => {
                  const style = SEVERITY_STYLES[c.severity];
                  return (
                    <div key={i} className={`rounded-xl ${style.bg} p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}
                        >
                          {style.label}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {c.file}:{c.line}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${style.text}`}>
                        <strong>{c.title}.</strong> {c.suggestion}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
              <button
                onClick={handleReset}
                className="rounded-full bg-neutral-900 px-7 py-3.5 font-medium text-white transition hover:bg-neutral-700"
              >
                Review another diff
              </button>
              <Link
                href="/#waitlist"
                className="rounded-full border border-neutral-300 px-7 py-3.5 font-medium text-neutral-900 transition hover:border-neutral-900 text-center"
              >
                Get early access
              </Link>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-neutral-400">
          This is a v0 preview with pattern-based checks.{" "}
          <Link href="/#waitlist" className="underline hover:text-neutral-600">
            Join the waitlist
          </Link>{" "}
          for the full AI-powered review experience.
        </p>
      </div>
    </div>
  );
}
