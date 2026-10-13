import express from "express";
import cors from "cors";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { errorHandler, notFound } from "./lib/errors.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/projects", projectsRouter());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
