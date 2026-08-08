import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aiCapabilities, defaultAiModel } from "@/lib/ai";
import { toolRegistry } from "@/lib/tools";
import type { ActivityItem, DashboardMetric } from "@/types";

const metrics: DashboardMetric[] = [
  {
    label: "Active incidents",
    value: "3",
    trend: "-2 in the last 24h",
    note: "All owned by the platform team.",
  },
  {
    label: "Automation success",
    value: "96.4%",
    trend: "+1.8% week over week",
    note: "Remediation runbooks are stable.",
  },
  {
    label: "Deploy safety score",
    value: "A-",
    trend: "No high-risk flags on the current batch",
    note: "Review gates are passing.",
  },
  {
    label: "MTTR estimate",
    value: "11m",
    trend: "4m faster than baseline",
    note: "Agent suggestions are shortening handoff time.",
  },
];

const activities: ActivityItem[] = [
  {
    title: "Cluster memory pressure",
    detail:
      "A node pool exceeded its normal threshold. The agent has already paged the on-call owner.",
    state: "urgent",
  },
  {
    title: "Canary deployment review",
    detail:
      "The latest rollout passed smoke tests and is waiting on the final approval gate.",
    state: "watching",
  },
  {
    title: "Runbook sync completed",
    detail:
      "The remediation playbook was refreshed with the newest alert routing policy.",
    state: "stable",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-950/40 px-6 py-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge tone="accent">SRE AGENT DASHBOARD</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                Operational control for AI-assisted incident response.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
                A dark-mode-first dashboard for coordinating deploy reviews,
                incident triage, and AI tool orchestration across your platform
                stack.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button>Open incident queue</Button>
            <Button tone="secondary">Review deployment</Button>
            <Button tone="ghost">View runbooks</Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-slate-950/80">
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cyan-200/80">{metric.trend}</p>
                <p className="text-sm text-slate-400">{metric.note}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Live operations lane</CardTitle>
                  <CardDescription>
                    Current incidents, deploys, and remediation state.
                  </CardDescription>
                </div>
                <Badge tone="outline">LIVE</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {activities.map((item) => {
                const tone =
                  item.state === "urgent"
                    ? "text-rose-200 border-rose-400/20 bg-rose-400/10"
                    : item.state === "watching"
                      ? "text-amber-200 border-amber-400/20 bg-amber-400/10"
                      : "text-emerald-200 border-emerald-400/20 bg-emerald-400/10";

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <h3 className="font-medium text-slate-50">
                        {item.title}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs uppercase tracking-[0.2em] ${tone}`}
                      >
                        {item.state}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI SDK foundation</CardTitle>
                <CardDescription>
                  Ready for model routing, structured output, and tool
                  orchestration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Default model:{" "}
                  <span className="text-slate-50">{defaultAiModel}</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-200">
                    Capabilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiCapabilities.map((capability) => (
                      <Badge key={capability} tone="outline">
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tool registry</CardTitle>
                <CardDescription>
                  Planned integrations for the agent runtime.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {toolRegistry.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-50">{tool.name}</p>
                      <Badge
                        tone={tool.status === "ready" ? "accent" : "outline"}
                      >
                        {tool.status}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
