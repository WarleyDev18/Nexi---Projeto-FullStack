import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/client.js";

export function useProjects() {
  const [state, setState] = useState({ status: "loading", items: [], error: null });

  const refresh = useCallback(async () => {
    try {
      setState({ status: "ready", items: await api.projects.list(), error: null });
    } catch (error) {
      setState((s) => ({ ...s, status: "error", error }));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (input) => {
    await api.projects.create(input); // throws ApiError; the form shows it
    await refresh();
  };

  return { ...state, create };
}
