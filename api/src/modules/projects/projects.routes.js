import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { createProjectsRepository } from "./projects.repository.js";
import { createProjectsService } from "./projects.service.js";
import { createProjectSchema, listProjectsQuerySchema } from "./projects.schema.js";

export function projectsRouter(service = createProjectsService(createProjectsRepository())) {
  const router = Router();

  router.get("/", asyncHandler(async (req, res) => {
    const query = listProjectsQuerySchema.parse(req.query);
    res.json({ data: await service.list(query) });
  }));

  router.post("/", asyncHandler(async (req, res) => {
    const input = createProjectSchema.parse(req.body);
    res.status(201).json({ data: await service.create(input) });
  }));

  return router;
}
