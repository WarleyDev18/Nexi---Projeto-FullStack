import { randomUUID } from "node:crypto";

// In-memory store behind a repository interface; swap for a real DB without touching the service.
export function createProjectsRepository() {
  const rows = new Map();
  return {
    async list() {
      return [...rows.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async insert(input) {
      const row = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
      rows.set(row.id, row);
      return row;
    },
    async findByName(name) {
      return [...rows.values()].find((r) => r.name.toLowerCase() === name.toLowerCase()) ?? null;
    },
  };
}
