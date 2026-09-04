/**
 * External job/internship source adapters — PS44 data sources:
 *  - SerpApi Google Jobs API   https://serpapi.com/google-jobs-api
 *  - fantastic.jobs API        https://fantastic.jobs/api
 *  - Upwork GraphQL API        https://www.upwork.com/developer/documentation/graphql/api/docs/index.html
 *
 * Each adapter is optional (needs an API key / network). When unavailable the
 * portal falls back to the locally seeded job board, so the MVP demo always works.
 */

export type ExternalJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  type: "FULL_TIME" | "INTERNSHIP";
  stipend?: string;
  applyUrl?: string;
  externalId?: string;
  source: "SERPAPI_GOOGLE_JOBS" | "FANTASTIC_JOBS" | "UPWORK";
};

type FetchOpts = { timeoutMs?: number };

async function safeFetch(url: string, init?: RequestInit, opts: FetchOpts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 6000);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const looksInternship = (text: string) => /intern|trainee|apprentice/i.test(text);

function classifyType(title: string): "FULL_TIME" | "INTERNSHIP" {
  return looksInternship(title) ? "INTERNSHIP" : "FULL_TIME";
}

/* ---------------- SerpApi Google Jobs ---------------- */

export async function fetchGoogleJobs(query = "software engineer internship", location = "India") {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(
    query
  )}&location=${encodeURIComponent(location)}&api_key=${key}`;
  const res = await safeFetch(url);
  if (!res || !res.ok) return [];
  try {
    const data = (await res.json()) as {
      jobs_results?: Array<{
        title?: string;
        company_name?: string;
        location?: string;
        description?: string;
        job_id?: string;
        thumbnail?: string;
      }>;
    };
    return (data.jobs_results ?? []).slice(0, 20).map<ExternalJob>((j) => ({
      title: j.title ?? "Untitled",
      company: j.company_name ?? "Unknown",
      location: j.location ?? "—",
      description: (j.description ?? "").slice(0, 1200),
      type: classifyType(j.title ?? ""),
      applyUrl: j.job_id ? `https://www.google.com/search?q=${encodeURIComponent(j.title ?? "")}+job` : undefined,
      externalId: j.job_id,
      source: "SERPAPI_GOOGLE_JOBS",
    }));
  } catch {
    return [];
  }
}

/* ---------------- fantastic.jobs ---------------- */

export async function fetchFantasticJobs(query = "internship") {
  const key = process.env.FANTASTIC_JOBS_KEY;
  const urlKey = key ? `?api_key=${key}` : "";
  const res = await safeFetch(`https://fantastic.jobs/api${urlKey}`);
  if (!res || !res.ok) return [];
  try {
    const data = await res.json();
    const list: Array<Record<string, unknown>> = Array.isArray(data)
      ? data
      : ((data as { jobs?: Array<Record<string, unknown>> }).jobs ?? []);
    return list
      .slice(0, 20)
      .filter((j) => !query || JSON.stringify(j).toLowerCase().includes(query.toLowerCase()))
      .map<ExternalJob>((j) => ({
        title: String(j.title ?? j.position ?? "Untitled"),
        company: String(j.company ?? j.company_name ?? "Unknown"),
        location: String(j.location ?? "Remote"),
        description: String(j.description ?? j.summary ?? "").slice(0, 1200),
        type: classifyType(String(j.title ?? "")),
        applyUrl: j.url ? String(j.url) : j.apply_url ? String(j.apply_url) : undefined,
        externalId: j.id ? String(j.id) : undefined,
        source: "FANTASTIC_JOBS",
      }));
  } catch {
    return [];
  }
}

/* ---------------- Upwork GraphQL ---------------- */

export async function fetchUpworkJobs(query = "web development") {
  const token = process.env.UPWORK_ACCESS_TOKEN;
  if (!token) return [];
  const res = await safeFetch("https://api.upwork.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `query($q: String!) { searchJobsNuxt(query: $q, first: 20) { edges { node { title ciphertext description { text } client { location { country } } } } } }`,
      variables: { q: query },
    }),
  });
  if (!res || !res.ok) return [];
  try {
    const data = (await res.json()) as {
      data?: {
        searchJobsNuxt?: {
          edges?: Array<{ node?: { title?: string; ciphertext?: string; description?: { text?: string }; client?: { location?: { country?: string } } } }>;
        };
      };
    };
    return (data.data?.searchJobsNuxt?.edges ?? []).slice(0, 20).map<ExternalJob>((e) => {
      const n = e.node ?? {};
      return {
        title: n.title ?? "Untitled",
        company: "Upwork Client",
        location: n.client?.location?.country ?? "Remote",
        description: (n.description?.text ?? "").slice(0, 1200),
        type: "FULL_TIME",
        applyUrl: n.ciphertext ? `https://www.upwork.com/jobs/${n.ciphertext}` : undefined,
        externalId: n.ciphertext,
        source: "UPWORK",
      };
    });
  } catch {
    return [];
  }
}

/* ---------------- Aggregate & upsert into local Job table ---------------- */

import { db } from "./db";
import type { JobSource, JobType } from "@prisma/client";

const sourceMap: Record<ExternalJob["source"], JobSource> = {
  SERPAPI_GOOGLE_JOBS: "SERPAPI_GOOGLE_JOBS",
  FANTASTIC_JOBS: "FANTASTIC_JOBS",
  UPWORK: "UPWORK",
};

export async function syncExternalJobs() {
  const results = await Promise.all([fetchGoogleJobs(), fetchFantasticJobs(), fetchUpworkJobs()]);
  const jobs = results.flat();
  let saved = 0;
  for (const j of jobs) {
    if (!j.title || !j.company) continue;
    const dupe = await db.job.findFirst({
      where: { source: sourceMap[j.source], externalId: j.externalId ?? null },
      select: { id: true },
    });
    if (dupe) continue;
    await db.job.create({
      data: {
        title: j.title.slice(0, 200),
        company: j.company.slice(0, 120),
        location: j.location.slice(0, 120),
        type: j.type as JobType,
        description: j.description,
        stipend: j.stipend,
        source: sourceMap[j.source],
        externalId: j.externalId,
        applyUrl: j.applyUrl,
      },
    });
    saved++;
  }
  return saved;
}
