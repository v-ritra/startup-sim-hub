import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { runValidation, type Report } from "@/lib/validate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STRATA — AI Market Validation Console for Founders" },
      {
        name: "description",
        content:
          "Stress-test a startup idea with AI simulations: viability index, persona reactions, market sizing, competitor threat and a go / no-go verdict.",
      },
      { property: "og:title", content: "STRATA — AI Market Validation Console" },
      {
        property: "og:description",
        content:
          "Run your business idea through an AI wind tunnel before you spend a dollar. Viability score, personas, risks, verdict.",
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
      name: "\u201cFreelance\u201d Mara, 34",
      archetype: "Solo designer",
      sentiment: 0.82,
      quote: "I\u2019d pay, but only if it drafts the proposal itself \u2014 not just stores it.",
    },
    {
      name: "\u201cStudio Lead\u201d Dan, 41",
      archetype: "Agency owner",
      sentiment: 0.31,
      quote: "Per-seat is fine for a solo act, but I won\u2019t buy it for a 12-person studio.",
    },
    {
      name: "\u201cSwitcher\u201d Rin, 29",
      archetype: "Tool migrator",
      sentiment: -0.14,
      quote: "My current tool already does this. I\u2019d need a reason to migrate my files.",
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
    headline: "PIVOT \u00b7 RUN $2K PROTOTYPE COHORT",
    rationale:
      "Demand is proven but the moat is thin. Validate retention against the two mid-market competitors before committing to a full build.",
  },
};

function sentimentColor(v: number) {
  if (v >= 0.5) return "text-cool";
  if (v >= 0) return "text-signal";
  return "text-heat";
}

function Console() {
  const [idea, setIdea] = useState("");
  const validate = useServerFn(runValidation);

  const mutation = useMutation({
    mutationFn: (value: string) => validate({ data: { idea: value } }),
  });

  const report: Report = mutation.data ?? SAMPLE;
  const running = mutation.isPending;
  const dash = 214;
  const offset = dash - (dash * report.viability) / 100;

  return (
    <div className="min-h-screen bg-ink text-bright font-display antialiased">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-panel/70 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-[5px] border border-signal/50 font-mono text-sm text-signal">
            S
          </div>
          <div className="leading-none">
            <div className="text-sm font-semibold tracking-wide">STRATA</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
              Validation Console
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 font-mono text-[11px] text-fog">
          <span className="hidden sm:inline">GRID&nbsp;04</span>
          <span className="hidden md:inline">LAT&nbsp;40.71 / LON&nbsp;-74.00</span>
          <span className="flex items-center gap-2 text-cool">
            <span
              className="size-1.5 rounded-full bg-cool"
              style={{ animation: "blink 1.6s linear infinite" }}
            />
            {running ? "SIMULATING" : "TELEMETRY LIVE"}
          </span>
        </div>
      </header>

      <section className="border-b border-line bg-gradient-to-b from-panel2 to-panel px-5 py-6">
        <div className="mx-auto max-w-[1240px]">
          <h1 className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
            Test Chamber \u00b7 Substrate Input
          </h1>
          <form
            className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (idea.trim().length >= 8) mutation.mutate(idea.trim());
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-md border border-line bg-ink px-4 py-3.5 focus-within:border-signal/60">
              <span className="font-mono text-sm text-signal">&gt;</span>
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="AI copilot subscription for freelance designers, sold per-seat"
                className="flex-1 bg-transparent font-mono text-sm text-bright outline-none placeholder:text-fog/60"
              />
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-fog sm:inline">
                SUBSTRATE_04
              </span>
            </div>
            <button
              type="submit"
              disabled={running || idea.trim().length < 8}
              className="rounded-md bg-signal px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-signal/85 disabled:opacity-40"
            >
              {running ? "Running\u2026" : "Run Validation"}
            </button>
          </form>
          {mutation.isError && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-heat">
              Simulation failed \u2014 {(mutation.error as Error).message}
            </p>
          )}
          {!mutation.data && !running && !mutation.isError && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fog">
              Showing reference run. Enter your own idea to simulate.
            </p>
          )}
        </div>
      </section>

      <main
        className={`mx-auto max-w-[1240px] px-5 py-6 transition-opacity ${running ? "opacity-40" : ""}`}
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="rise col-span-12 rounded-lg border border-line bg-panel p-5 lg:col-span-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                Viability Index
              </span>
              <span className="font-mono text-[11px] text-signal">GAUGE\u00b7A</span>
            </div>
            <div className="relative mx-auto mt-4 size-[180px]">
              <div className="absolute inset-0 rounded-full border border-line/60" />
              <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--line)"
                  strokeWidth="6"
                  pathLength={dash}
                />
                <circle
                  key={report.viability}
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--signal)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength={dash}
                  style={{
                    strokeDasharray: dash,
                    strokeDashoffset: offset,
                    animation: "draw 1.4s cubic-bezier(0.32,0.72,0,1) 0.2s both",
                  }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-mono text-5xl font-semibold text-bright">
                    {report.viability}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                    / 100
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-signal/40 bg-signal/10 px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                Verdict
              </span>
              <span className="font-mono text-sm font-semibold text-signal">
                {report.verdictLabel}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="rounded border border-line bg-panel2 px-2 py-1.5">
                <div className="text-fog">DEMAND</div>
                <div className="mt-0.5 text-sm text-cool">{report.demand}</div>
              </div>
              <div className="rounded border border-line bg-panel2 px-2 py-1.5">
                <div className="text-fog">MARGIN</div>
                <div className="mt-0.5 text-sm text-signal">{report.margin}</div>
              </div>
              <div className="rounded border border-line bg-panel2 px-2 py-1.5">
                <div className="text-fog">MOAT</div>
                <div className="mt-0.5 text-sm text-heat">{report.moat}</div>
              </div>
            </div>
          </div>

          <div
            className="rise col-span-12 rounded-lg border border-line bg-panel p-5 lg:col-span-5"
            style={{ animationDelay: "0.08s" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                Persona Wind Tunnel
              </span>
              <span className="font-mono text-[11px] text-fog">
                {report.personas.length} SUBJECTS
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {report.personas.map((p, i) => (
                <div
                  key={p.name + i}
                  className="rise rounded-md border border-line bg-panel2 p-3"
                  style={{ animationDelay: `${0.18 + i * 0.08}s` }}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-bright">
                      P-0{i + 1} \u00b7 {p.name}
                    </span>
                    <span className={sentimentColor(p.sentiment)}>
                      {p.sentiment >= 0 ? "+" : ""}
                      {p.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-snug text-fog">\u201c{p.quote}\u201d</p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            <div
              className="rise rounded-lg border border-line bg-panel p-5"
              style={{ animationDelay: "0.14s" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                  Market / Competitors
                </span>
                <span className="font-mono text-[11px] text-fog">{report.competitors.length}</span>
              </div>
              <div className="mt-3 font-mono text-[11px]">
                <div className="flex items-baseline justify-between">
                  <span className="text-fog">TAM</span>
                  <span className="text-bright">{report.market.tam}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-fog">SAM</span>
                  <span className="text-bright">{report.market.sam}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-fog">SOM</span>
                  <span className="text-signal">{report.market.som}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2 font-mono text-[11px]">
                {report.competitors.map((c, i) => (
                  <div key={c.name + i} className="flex items-center gap-2">
                    <span className="w-12 truncate text-fog">{c.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-line">
                      <div
                        className="h-full bg-bright/70"
                        style={{
                          width: `${Math.round(c.threat * 100)}%`,
                          animation: `fill 1s cubic-bezier(0.32,0.72,0,1) ${0.3 + i * 0.08}s both`,
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-fog">{c.threat.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rise flex-1 rounded-lg border border-line bg-panel p-5"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-fog">
                  Risk Flags
                </span>
                <span className="font-mono text-[11px] text-heat">{report.risks.length}</span>
              </div>
              <div className="mt-3 space-y-2.5">
                {report.risks.map((r, i) => (
                  <div key={r.text + i} className="flex gap-2.5">
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${r.severity === "HIGH" ? "bg-heat" : r.severity === "MED" ? "bg-signal" : "bg-cool"}`}
                    />
                    <div className="text-xs leading-snug text-fog">
                      <span
                        className={`font-mono text-[10px] uppercase ${r.severity === "HIGH" ? "text-heat" : r.severity === "MED" ? "text-signal" : "text-cool"}`}
                      >
                        {r.severity}
                      </span>{" "}
                      \u00b7 {r.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="rise mt-4 flex flex-col gap-4 rounded-lg border border-line bg-panel2 px-5 py-4 sm:flex-row sm:items-center"
          style={{ animationDelay: "0.28s" }}
        >
          <div className="shrink-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-fog">
              Next-Step Verdict
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-signal">
              {report.nextStep.headline}
            </div>
          </div>
          <p className="text-sm leading-snug text-fog">{report.nextStep.rationale}</p>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "strata-validation-report.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="shrink-0 rounded-md border border-signal/50 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-signal transition-colors hover:bg-signal hover:text-ink"
          >
            Export Report
          </button>
        </div>
      </main>

      <footer className="border-t border-line px-5 py-4">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
          <span>STRATA \u00b7 Validation Console v2.4</span>
          <span>Simulation \u2014 not a substitute for live market data</span>
          <span>Session 0x7F3A</span>
        </div>
      </footer>
    </div>
  );
}
