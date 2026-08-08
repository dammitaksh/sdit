"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  createDefaultIncidentReport,
  createProgressiveChatMessage,
  incidentReportSchema,
  type IncidentReport,
  type ProgressiveChatMessage,
} from "@/types/dashboard-state";

type DashboardStateContextValue = {
  progressiveChat: ProgressiveChatMessage[];
  assistantDraft: string;
  chatPhase: "idle" | "streaming" | "complete";
  incidentReport: IncidentReport;
  appendUserMessage: (content: string) => void;
  appendAssistantMessage: (content: string) => void;
  updateAssistantDraft: (draft: string) => void;
  patchIncidentReport: (patch: Partial<IncidentReport>) => void;
  resetConversation: () => void;
};

const DashboardStateContext = createContext<DashboardStateContextValue | null>(
  null,
);

export function DashboardStateProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [progressiveChat, setProgressiveChat] = useState<
    ProgressiveChatMessage[]
  >([]);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [chatPhase, setChatPhase] = useState<"idle" | "streaming" | "complete">(
    "idle",
  );
  const [incidentReport, setIncidentReport] = useState<IncidentReport>(() =>
    createDefaultIncidentReport(),
  );

  const appendUserMessage = useCallback((content: string) => {
    setChatPhase("streaming");
    setProgressiveChat((previous) => [
      ...previous,
      createProgressiveChatMessage("user", content, "final"),
    ]);
  }, []);

  const appendAssistantMessage = useCallback((content: string) => {
    setProgressiveChat((previous) => [
      ...previous,
      createProgressiveChatMessage("assistant", content, "final"),
    ]);
    setAssistantDraft("");
    setChatPhase("complete");
  }, []);

  const updateAssistantDraft = useCallback((draft: string) => {
    setAssistantDraft(draft);
    setChatPhase(draft ? "streaming" : "idle");
  }, []);

  const patchIncidentReport = useCallback((patch: Partial<IncidentReport>) => {
    setIncidentReport((previous) =>
      incidentReportSchema.parse({
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, []);

  const resetConversation = useCallback(() => {
    setProgressiveChat([]);
    setAssistantDraft("");
    setChatPhase("idle");
    setIncidentReport(createDefaultIncidentReport());
  }, []);

  const value = useMemo<DashboardStateContextValue>(
    () => ({
      progressiveChat,
      assistantDraft,
      chatPhase,
      incidentReport,
      appendUserMessage,
      appendAssistantMessage,
      updateAssistantDraft,
      patchIncidentReport,
      resetConversation,
    }),
    [
      assistantDraft,
      appendAssistantMessage,
      appendUserMessage,
      chatPhase,
      incidentReport,
      patchIncidentReport,
      progressiveChat,
      resetConversation,
      updateAssistantDraft,
    ],
  );

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
}

export function useDashboardState() {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error(
      "useDashboardState must be used within a DashboardStateProvider",
    );
  }

  return context;
}