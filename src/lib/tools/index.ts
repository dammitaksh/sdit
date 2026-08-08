import { tool } from 'ai';
import { z } from 'zod';

export const fetchGitHubCommits = tool({
  description: 'Returns a mock list of recent commits for a given repository.',
  parameters: z.object({
    repo: z.string().describe('The repository name, e.g., "owner/repo"'),
  }),
  execute: async ({ repo }) => {
    return {
      repo,
      commits: [
        { sha: 'a1b2c3d4', message: 'fix(db): resolve connection pool exhaustion', author: 'alice-devops' },
        { sha: 'e5f6g7h8', message: 'feat(api): add new rate limiting middleware', author: 'bob-backend' },
        { sha: 'i9j0k1l2', message: 'chore(deps): bump next from 14.2 to 15.0', author: 'dependabot' },
      ]
    };
  },
});

export const queryDatabaseStatus = tool({
  description: 'Returns mock connection pool statistics for a given database.',
  parameters: z.object({
    databaseId: z.string().describe('The ID or name of the database to query'),
  }),
  execute: async ({ databaseId }) => {
    return {
      databaseId,
      status: 'degraded',
      activeConnections: 485,
      idleConnections: 15,
      maxConnections: 500,
      uptimeSeconds: 86400,
    };
  },
});

export const readServerLogs = tool({
  description: 'Returns a mock string of recent server error logs.',
  parameters: z.object({
    serviceName: z.string().describe('The name of the service to fetch logs for'),
    lines: z.number().optional().describe('Number of lines to fetch'),
  }),
  execute: async ({ serviceName, lines = 5 }) => {
    return `[ERROR] [${serviceName}] 2026-07-17T01:15:00Z - ConnectionTimeoutError: failed to acquire connection from pool
[WARN] [${serviceName}] 2026-07-17T01:15:05Z - Retrying database connection (attempt 1)
[ERROR] [${serviceName}] 2026-07-17T01:15:10Z - ConnectionTimeoutError: failed to acquire connection from pool
[FATAL] [${serviceName}] 2026-07-17T01:15:15Z - Service degraded. Alerting on-call engineer.`;
  },
});
