import { createClient } from "@nexi/sdk";

export const api = createClient({ baseUrl: import.meta.env.VITE_API_URL ?? "/api" });
