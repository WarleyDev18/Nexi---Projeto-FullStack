import { useState } from "react";
import { useProjects } from "./useProjects.js";

export function ProjectsPage() {
  const { status, items, error, create } = useProjects();
  const [name, setName] = useState("");
  const [formError, setFormError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await create({ name });
      setName("");
      setFormError(null);
    } catch (err) {
      setFormError(err.details?.name?.[0] ?? err.message);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Projects</h1>
      <form onSubmit={onSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        <button type="submit">Create</button>
        {formError && <p role="alert">{formError}</p>}
      </form>
      {status === "loading" && <p>Loading…</p>}
      {status === "error" && <p role="alert">{error.message}</p>}
      {status === "ready" && items.length === 0 && <p>No projects yet.</p>}
      <ul>{items.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
    </main>
  );
}
