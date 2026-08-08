"use server";

import { google } from "@ai-sdk/google";
import { streamText as aiStreamText, type CoreMessage } from "ai";
import { z } from "zod";

import { incidentReportSchema, type IncidentReport } from "@/types/dashboard-state";

const streamRequestSchema = z.object({
  messages: z.array(z.any()),
  incidentReport: incidentReportSchema.optional(),
});

type StreamRequest = {
  messages: CoreMessage[];
  incidentReport?: IncidentReport;
};

export async function streamText(input: StreamRequest) {
  const { messages, incidentReport } = streamRequestSchema.parse(input);

  return aiStreamText({
    model: google("gemini-3.1-pro"),
    system: incidentReport
      ? `You are an SRE incident assistant. Use the incident report context below and keep outputs concise.\n\nIncident report:\n${JSON.stringify(incidentReport, null, 2)}`
      : "You are an SRE incident assistant. Keep the response concise and operational.",
    messages: messages as CoreMessage[],
  });
}