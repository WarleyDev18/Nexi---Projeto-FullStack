import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().default(""),
});

export const listProjectsQuerySchema = z.object({
  search: z.string().trim().optional(),
});
