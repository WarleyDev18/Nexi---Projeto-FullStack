import { projectsApi } from "./projects.js";

export { ApiError } from "./http.js";

export function createClient({ baseUrl }) {
  return { projects: projectsApi(baseUrl) };
}
