import { request } from "./http.js";

/**
 * @typedef {{ id: string, name: string, description: string, createdAt: string }} Project
 */

export const projectsApi = (baseUrl) => ({
  /** @returns {Promise<Project[]>} */
  list: (query) => request(baseUrl, "/projects", { query }),
  /** @returns {Promise<Project>} */
  create: (input) => request(baseUrl, "/projects", { method: "POST", body: input }),
});
