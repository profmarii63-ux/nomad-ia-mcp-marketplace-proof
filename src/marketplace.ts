export type MarketplaceProject = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  status?: string;
  skills?: string[];
};

export type SearchFilters = {
  query?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
};

export type MarketplaceClientOptions = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeProject(raw: unknown): MarketplaceProject | null {
  const row = asRecord(raw);
  const id = asString(row.id ?? row.projectId ?? row.slug);
  const title = asString(row.title ?? row.name);
  if (!id || !title) return null;

  const budget = asRecord(row.budget);
  const min = asNumber(row.budgetMin ?? row.minBudget ?? budget.min);
  const max = asNumber(row.budgetMax ?? row.maxBudget ?? budget.max);
  const skills = Array.isArray(row.skills)
    ? row.skills.map(asString).filter((v): v is string => Boolean(v))
    : undefined;

  const description = asString(row.description);
  const category = asString(row.category);
  const status = asString(row.status);

  return {
    id,
    title,
    ...(description ? { description } : {}),
    ...(category ? { category } : {}),
    ...(min !== undefined ? { budgetMin: min } : {}),
    ...(max !== undefined ? { budgetMax: max } : {}),
    ...(status ? { status } : {}),
    ...(skills?.length ? { skills } : {})
  };
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  for (const key of ["projects", "items", "data", "results"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

export class MarketplaceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;

  constructor(options: MarketplaceClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 8000;
  }

  private async getJson(path: string): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = new Headers({ accept: "application/json" });
      if (this.apiKey) headers.set("authorization", "Bearer " + this.apiKey);
      const response = await this.fetchImpl(this.baseUrl + path, {
        method: "GET",
        headers,
        signal: controller.signal
      });
      if (!response.ok) throw new Error("upstream_http_" + response.status);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async searchProjects(filters: SearchFilters = {}): Promise<MarketplaceProject[]> {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.category) params.set("category", filters.category);
    if (filters.budgetMin !== undefined) params.set("budget_min", String(filters.budgetMin));
    if (filters.budgetMax !== undefined) params.set("budget_max", String(filters.budgetMax));
    const suffix = params.size ? "?" + params.toString() : "";
    const payload = await this.getJson("/projects" + suffix);
    return extractRows(payload).map(normalizeProject).filter((p): p is MarketplaceProject => Boolean(p));
  }

  async getProject(id: string): Promise<MarketplaceProject | null> {
    const payload = await this.getJson("/projects/" + encodeURIComponent(id));
    const direct = normalizeProject(payload);
    if (direct) return direct;
    const record = asRecord(payload);
    return normalizeProject(record.project ?? record.data);
  }

  async listCategories(): Promise<string[]> {
    try {
      const payload = await this.getJson("/categories");
      const values = Array.isArray(payload) ? payload : extractRows(payload);
      const categories = values
        .map((item) => typeof item === "string" ? item : asString(asRecord(item).name ?? asRecord(item).category))
        .filter((v): v is string => Boolean(v));
      return [...new Set(categories)].sort();
    } catch {
      const projects = await this.searchProjects();
      return [...new Set(projects.map((p) => p.category).filter((v): v is string => Boolean(v)))].sort();
    }
  }
}
