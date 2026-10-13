import { AppError } from "../../lib/errors.js";

export function createProjectsService(repo) {
  return {
    async list({ search }) {
      const all = await repo.list();
      if (!search) return all;
      const q = search.toLowerCase();
      return all.filter((p) => p.name.toLowerCase().includes(q));
    },
    async create(input) {
      if (await repo.findByName(input.name)) {
        throw new AppError(409, "project_name_taken", "A project with this name already exists");
      }
      return repo.insert(input);
    },
  };
}
