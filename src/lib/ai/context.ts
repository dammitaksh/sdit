export function getIncidentContext(query: string): string {
  // Simulate RAG by returning hardcoded context for database issues
  return `
# SKILL: Debugging High Database CPU
## Description
This skill provides procedural steps to investigate and mitigate high CPU usage on the primary database cluster.

## Investigation Steps
1. **Check Connection Pools**: Use \`queryDatabaseStatus\` to see if the connection pool is exhausted or degraded.
2. **Review Recent Changes**: Use \`fetchGitHubCommits\` to identify any recent deployments that might have introduced unoptimized queries or connection leaks.
3. **Analyze Logs**: Use \`readServerLogs\` to check for database connection timeouts or query errors.

## Mitigation Strategy
- If connections are exhausted and there's a recent deployment, consider rolling back.
- If it's a traffic spike, alert the on-call engineer to scale the read replicas.
`;
}
