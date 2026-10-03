import type { NextRequest } from "next/server";

import { getProjectForUser, getSessionUser } from "@/lib/projects";
import { getJson } from "@/lib/storage";

type Word = [number, number, string];

// A 10 h transcript is a few MB: keep the last few in memory, since the
// editor asks for many small ranges of the same one.
const cache = new Map<string, Word[]>();
const CACHE_SIZE = 4;

async function loadWords(key: string) {
  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }
  const words = ((await getJson(key)) as { words: Word[] }).words;
  cache.set(key, words);
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!);
  return words;
}

// Words spoken between ?from= and ?to= (seconds), as [start, end, text].
export async function GET(request: NextRequest, ctx: RouteContext<"/api/projects/[id]/transcript">) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "unauthenticated" }, { status: 401 });

  const project = await getProjectForUser((await ctx.params).id, user.id);
  if (!project) return Response.json({ error: "not_found" }, { status: 404 });
  if (!project.transcriptKey) return Response.json({ words: [] });

  const from = Number(request.nextUrl.searchParams.get("from") ?? 0);
  const to = Number(request.nextUrl.searchParams.get("to") ?? 0);
  if (!Number.isFinite(from) || !Number.isFinite(to) || to - from > 3600) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const words = await loadWords(project.transcriptKey);
  return Response.json({ words: words.filter(([start, end]) => end > from && start < to) });
}
