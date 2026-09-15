import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const ReportSchema = z.object({
  substrate: z.string().describe("The idea restated in one crisp line, max 90 chars"),
  viability: z.number().min(0).max(100),
  verdictLabel: z
    .string()
    .describe("Short uppercase verdict, e.g. CONDITIONAL GO, HARD NO, CLEAR GO"),
  demand: z.number().min(0).max(100),
  margin: z.number().min(0).max(100),
  moat: z.number().min(0).max(100),
  personas: z
    .array(
      z.object({
        name: z.string().describe("e.g. \u201cFreelance\u201d Mara, 34"),
        archetype: z.string().describe("2-3 word role label"),
        sentiment: z.number().min(-1).max(1),
        quote: z.string().describe("One sentence in their voice, blunt and specific"),
      }),
    )
    .length(3),
  market: z.object({
    tam: z.string(),
    sam: z.string(),
    som: z.string(),
  }),
  competitors: z
    .array(z.object({ name: z.string(), threat: z.number().min(0).max(1) }))
    .min(3)
    .max(5),
  risks: z
    .array(
      z.object({
        severity: z.enum(["HIGH", "MED", "LOW"]),
        text: z.string().describe("One short clause"),
      }),
    )
    .min(2)
    .max(4),
  nextStep: z.object({
    headline: z.string().describe("Uppercase directive, e.g. PIVOT \u00b7 RUN $2K PROTOTYPE COHORT"),
    rationale: z.string().describe("Two sentences max"),
  }),
});

export type Report = z.infer<typeof ReportSchema>;

export const runValidation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ idea: z.string().min(8).max(600) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const gateway = createLovableAiGatewayProvider(key);

    const result = await generateText({
      model: gateway("google/gemini-3.8-flash"),
      output: Output.object({ schema: ReportSchema }),
      system:
        "You are STRATA, a blunt market-validation engine for pre-seed founders. " +
        "You simulate customer personas, size markets, name real-world competitor categories, " +
        "and issue a go / conditional / no-go verdict. Be specific and numeric. " +
        "Never flatter. Scores must reflect genuine weaknesses. Money figures use $ with B/M/K suffixes.",
      prompt: `Run a full validation pass on this business idea:\n\n${data.idea}`,
    });

    return await result.output;
  });
