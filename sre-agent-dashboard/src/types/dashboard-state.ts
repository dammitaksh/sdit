import { z } from "zod";

export const progressiveChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  createdAt: z.string(),
  status: z.enum(["draft", "streaming", "final"]),
});

export type ProgressiveChatMessage = z.infer<typeof progressiveChatMessageSchema>;

export const incidentReportSchema = z.object({
  incidentId: z.string(),
  title: z.string(),
  severity: z.enum(["sev-1", "sev-2", "sev-3", "sev-4"]),
  status: z.enum(["open", "triaging", "mitigating", "resolved"]),
  summary: z.string(),
  owner: z.string(),
  timeline: z.array(z.string()),
  actionItems: z.array(z.string()),
  updatedAt: z.string(),
});

export type IncidentReport = z.infer<typeof incidentReportSchema>;

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}`;
}

export function createProgressiveChatMessage(
  role: ProgressiveChatMessage["role"],
  content: string,
  status: ProgressiveChatMessage["status"] = "final",
): ProgressiveChatMessage {
  return progressiveChatMessageSchema.parse({
    id: createId("chat"),
    role,
    content,
    createdAt: new Date().toISOString(),
    status,
  });
}

export function createDefaultIncidentReport(): IncidentReport {
  return incidentReportSchema.parse({
    incidentId: "INC-0001",
    title: "New incident",
    severity: "sev-3",
    status: "triaging",
    summary: "",
    owner: "unassigned",
    timeline: [],
    actionItems: [],
    updatedAt: new Date().toISOString(),
  });
}