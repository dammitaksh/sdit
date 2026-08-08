export type ToolDefinition = {
    name: string;
    description: string;
    status: "ready" | "planned" | "inactive";
};

export const toolRegistry: ToolDefinition[] = [
    {
        name: "incident-router",
        description: "Classifies alerts, deduplicates noise, and escalates the right owner.",
        status: "ready",
    },
    {
        name: "change-reviewer",
        description: "Summarizes deploy diffs and flags risky configuration changes.",
        status: "ready",
    },
    {
        name: "runbook-assistant",
        description: "Retrieves the next operational action from internal docs.",
        status: "planned",
    },
];