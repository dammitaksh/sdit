import { create } from "zustand";

export interface IncidentReport {
  id: string;
  title: string;
  status: "open" | "investigating" | "resolved";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface PostMortem {
  incidentTitle: string;
  rootCause: string;
  affectedSystems: string[];
  suggestedFixCodeSnippet: string;
}

interface AppState {
  // Chat state
  isChatOpen: boolean;
  toggleChat: () => void;
  
  // Incident Report state
  activeIncident: IncidentReport | null;
  setActiveIncident: (incident: IncidentReport | null) => void;
  updateIncident: (updates: Partial<IncidentReport>) => void;

  // Post-Mortem state
  postMortem: PostMortem | null;
  isGeneratingPostMortem: boolean;
  setPostMortem: (pm: PostMortem | null) => void;
  setIsGeneratingPostMortem: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  
  activeIncident: null,
  setActiveIncident: (incident) => set({ activeIncident: incident }),
  updateIncident: (updates) => set((state) => ({
    activeIncident: state.activeIncident 
      ? { ...state.activeIncident, ...updates }
      : null
  })),

  postMortem: null,
  isGeneratingPostMortem: false,
  setPostMortem: (pm) => set({ postMortem: pm }),
  setIsGeneratingPostMortem: (v) => set({ isGeneratingPostMortem: v }),
}));
