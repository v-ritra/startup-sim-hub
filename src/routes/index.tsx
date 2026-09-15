import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { runValidation, type Report } from "@/lib/validate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaunchPad AI — Validate a Business Idea Before You Build" },
      {
        name: "description",
        content:
          "Stress-test a startup idea with AI: viability score, customer reactions, market size, competitors, risks and a clear next step.",
      },
      { property: "og:title", content: "LaunchPad AI — Validate a Business Idea" },
      {
        property: "og:description",
        content:
          "Honest, encouraging AI validation for early-stage founders. Score, personas, market, risks and next step in seconds.",
      },
    ],
  }),
  component: Console,
});

const SAMPLE: Report = {
  substrate: "AI copilot subscription for freelance designers, sold per-seat",
  viability: 72,
  verdictLabel: "CONDITIONAL GO",
  demand: 68,
  margin: 54,
  moat: 41,
  personas: [
    {
      name: "“Freelance” Mara, 34",
      archetype: "Solo designer",
      sentiment: 0.82,
      quote: "I’d pay, but only if it drafts the proposal itself — not just stores it.",
    },
    {
      name: "“Studio Lead” Dan, 41",
      archetype: "Agency owner",
      sentiment: 0.31,
      quote: "Per-seat is fine for a solo act, but I won’t buy it for a 12-person studio.",
    },
    {
      name: "“Switcher” Rin, 29",
      archetype: "Tool migrator",
      sentiment: -0.14,
      quote: "My current tool already does this. I’d need a reason to migrate my files.",
    },
  ],
  market: { tam: "$4.2B", sam: "$610M", som: "$18M" },
  competitors: [
    { name: "Draftly", threat: 0.78 },
    { name: "Relay", threat: 0.61 },
    { name: "Nimbus", threat: 0.44 },
    { name: "Kite", threat: 0.29 },
  ],
  risks: [
    { severity: "HIGH", text: "Moat erosion from LLM feature parity" },
    { severity: "MED", text: "Churn risk among solo freelancers" },
    { severity: "MED", text: "Per-seat pricing vs. studio demand" },
  ],
  nextStep: {
    headline: "Run a $2K prototype cohort before building",
    rationale:
      "Demand is proven but the moat is thin. Validate retention against the two mid-market competitors before committing to a full build.",
  },
};

function band(score: number) {
  if (score >= 70) return { label: "Strong", tone: "good" as const };
  if (score >= 45) return { label: "Mixed", tone: "warn" as const };
  return { label: "Weak", tone: "bad" as const };
}

const barTone = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
};

function Pillar({ title, score, delay }: { title: string; score: number; delay: string }) {
  const b = band(score);
  return (
    <div
      className="rise lift rounded-2xl border border-hairline bg-surface p-6 shadow-sm"
      style={{ animationDelay: delay }}
    >
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">{title}</h4>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="font-display text-2xl text-ink">{b.label}</span>
        <span className="text-sm font-semibold text-ink-soft">{score}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
        <div
          className={`h-full ${barTone[b.tone]}`}
          style={{ width: `${score}%`, animation: "fill 1s cubic-bezier(0.32,0.72,0,1) 0.2s both" }}
        />
      </div>
    </div>
  );
}

function Console() {
  const [idea, setIdea] = useState("");
  const validate = useServerFn(runValidation);

  const mutation = useMutation({
    mutationFn: (value: string) => validate({ data: { idea: value } }),
  });

  const report: Report = mutation.data ?? SAMPLE;
  const running = mutation.isPending;
  const b = band(report.viability);
  const CIRC = 364.4;
  const offset = CIRC - (CIRC * report.viability) / 100;

  const ringColor = { good: "text-good", warn: "text-warn", bad: "text-bad" }[b.tone];
  const pillTone = {
    good: "bg-good-soft text-good",
    warn: "bg-warn-soft text-warn",
    bad: "bg-bad-soft text-bad",
  }[b.tone];

  return (
    <div className="min-h-screen bg-canvas px-6 py-10 text-ink antialiased lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Idea input */}
        <form
          className="rise mb-10 rounded-3xl border border-hairline bg-surface p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (idea.trim().length >= 8) mutation.mutate(idea.trim());
          }}
        >
          <label
            htmlFor="idea"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint"
          >
            Your business idea
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="A subscription that delivers fresh dog food to city apartments"
              className="flex-1 rounded-xl border border-hairline bg-canvas px-4 py-3 text-base text-ink outline-none placeholder:text-ink-faint focus:border-ink-soft"
            />
            <button
              type="submit"
              disabled={running || idea.trim().length < 8}
              className="rounded-xl bg-contrast px-7 py-3 font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-35"
            >
              {running ? "Validating…" : "Validate idea"}
            </button>
          </div>
          {mutation.isError && (
            <p className="mt-3 text-sm text-bad">
              Something went wrong — {(mutation.error as Error).message}
            </p>
          )}
          {!mutation.data && !running && !mutation.isError && (
            <p className="mt-3 text-sm text-ink-faint">
              Showing an example report. Enter your own idea to run a fresh one.
            </p>
          )}
        </form>

        <div className={running ? "opacity-40 transition-opacity" : "transition-opacity"}>
          {/* Header & export */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                Original concept
              </span>
              <h1 className="mt-1 max-w-2xl font-display text-2xl leading-tight text-ink">
                {report.substrate}
              </h1>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(report, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "launchpad-validation-report.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-soft"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export report
            </button>
          </div>

          {/* Hero score & next step */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rise rounded-3xl border border-hairline bg-surface p-8 shadow-sm md:col-span-2">
              <div className="flex flex-col items-center gap-8 sm:flex-row">
                <div className="relative shrink-0">
                  <svg className="size-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-surface-soft"
                    />
                    <circle
                      key={report.viability}
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray={CIRC}
                      strokeDashoffset={offset}
                      className={ringColor}
                      style={{ animation: "draw 1.3s cubic-bezier(0.32,0.72,0,1) 0.2s both" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl text-ink">{report.viability}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-ink-faint">
                      Score
                    </span>
                  </div>
                </div>
                <div>
                  <div
                    className={`mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${pillTone}`}
                  >
                    {report.verdictLabel}
                  </div>
                  <p className="text-lg font-medium leading-snug text-ink-soft">
                    {report.nextStep.rationale}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rise flex flex-col justify-between rounded-3xl bg-contrast p-8 text-canvas"
              style={{ animationDelay: "0.06s" }}
            >
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-canvas/60">
                  Next step
                </h3>
                <p className="font-display text-xl leading-snug">{report.nextStep.headline}</p>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Pillar title="Market demand" score={report.demand} delay="0.1s" />
            <Pillar title="Profit margin" score={report.margin} delay="0.16s" />
            <Pillar title="Defensibility" score={report.moat} delay="0.22s" />
          </div>

          {/* Personas */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {report.personas.map((p, i) => (
              <div
                key={p.name + i}
                className="rise rounded-2xl border border-hairline/70 bg-surface-soft p-6"
                style={{ animationDelay: `${0.26 + i * 0.06}s` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`size-8 shrink-0 rounded-full ${p.sentiment >= 0.5 ? "bg-good" : p.sentiment >= 0 ? "bg-warn" : "bg-bad"} opacity-70`}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink">{p.name}</div>
                    <div className="truncate text-xs text-ink-faint">{p.archetype}</div>
                  </div>
                </div>
                <p className="text-sm italic leading-relaxed text-ink-soft">“{p.quote}”</p>
              </div>
            ))}
          </div>

          {/* Market & risks */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div
              className="rise rounded-2xl border border-hairline bg-surface p-8 shadow-sm"
              style={{ animationDelay: "0.44s" }}
            >
              <h4 className="mb-6 font-display text-sm text-ink">Market context</h4>
              <div className="space-y-3">
                {(
                  [
                    ["Total addressable market", report.market.tam],
                    ["Serviceable market", report.market.sam],
                    ["Realistic first slice", report.market.som],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-hairline pb-2 text-sm"
                  >
                    <span className="text-ink-soft">{label}</span>
                    <span className="font-bold text-ink">{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-faint">
                  Key competitors
                </span>
                <div className="mt-3 space-y-2">
                  {report.competitors.map((c, i) => (
                    <div key={c.name + i} className="flex items-center gap-3 text-sm">
                      <span className="flex-1 text-ink-soft">{c.name}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-soft">
                        <div
                          className="h-full bg-ink/70"
                          style={{
                            width: `${Math.round(c.threat * 100)}%`,
                            animation: `fill 1s cubic-bezier(0.32,0.72,0,1) ${0.3 + i * 0.07}s both`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-ink-faint">
                        {Math.round(c.threat * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="rise rounded-2xl border border-hairline bg-surface p-8 shadow-sm"
              style={{ animationDelay: "0.5s" }}
            >
              <h4 className="mb-6 font-display text-sm text-ink">Critical risks</h4>
              <ul className="space-y-3">
                {report.risks.map((r, i) => (
                  <li key={r.text + i} className="flex items-start gap-3">
                    <div
                      className={`grid size-5 shrink-0 place-items-center rounded ${r.severity === "HIGH" ? "bg-bad-soft" : r.severity === "MED" ? "bg-warn-soft" : "bg-good-soft"}`}
                    >
                      <div
                        className={`size-2 rounded-full ${r.severity === "HIGH" ? "bg-bad" : r.severity === "MED" ? "bg-warn" : "bg-good"}`}
                      />
                    </div>
                    <span className="text-sm leading-snug text-ink-soft">{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-10 text-center text-xs text-ink-faint">
            LaunchPad AI simulations are a starting point, not a substitute for talking to real
            customers.
          </p>
        </div>
      </div>
    </div>
  );
}
