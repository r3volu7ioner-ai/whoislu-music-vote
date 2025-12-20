/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Json = Record<string, unknown>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function json(status: number, body: Json) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

function isAdmin(reqBody: any) {
  return ADMIN_PASSWORD && reqBody?.password && reqBody.password === ADMIN_PASSWORD;
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json(200, { ok: true });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const action = body?.action as string | undefined;
  if (!action) return json(400, { error: "Missing action" });

  try {
    // ---------------------------
    // Public actions (voters)
    // ---------------------------
    if (action === "getTracks") {
      const { data: tracks, error: tErr } = await supabase
        .from("tracks")
        .select("id,title,duration,is_bonus,edition,emotional_tag,cover_image,audio_url,sort_order")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (tErr) throw tErr;

      // Counts
      const { data: voteRows, error: vErr } = await supabase
        .from("votes")
        .select("track_id", { count: "exact", head: false });
      if (vErr) throw vErr;

      const { data: favRows, error: fErr } = await supabase
        .from("favorites")
        .select("track_id", { count: "exact", head: false });
      if (fErr) throw fErr;

      const { data: commentRows, error: cErr } = await supabase
        .from("comments")
        .select("id,track_id,text,timestamp,created_at,voters(name)", { head: false })
        .order("created_at", { ascending: false });
      if (cErr) throw cErr;

      const voteCount: Record<number, number> = {};
      for (const r of voteRows ?? []) voteCount[(r as any).track_id] = (voteCount[(r as any).track_id] ?? 0) + 1;

      const favCount: Record<number, number> = {};
      for (const r of favRows ?? []) favCount[(r as any).track_id] = (favCount[(r as any).track_id] ?? 0) + 1;

      const commentsByTrack: Record<number, any[]> = {};
      for (const r of commentRows ?? []) {
        const tr = r as any;
        const tid = tr.track_id as number;
        commentsByTrack[tid] = commentsByTrack[tid] ?? [];
        commentsByTrack[tid].push({
          id: tr.id,
          voterName: tr.voters?.name ?? "Anon",
          text: tr.text,
          timestamp: tr.timestamp,
          createdAt: tr.created_at,
        });
      }

      const enriched = (tracks ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        isBonus: t.is_bonus,
        edition: t.edition,
        emotionalTag: t.emotional_tag,
        votes: voteCount[t.id] ?? 0,
        favorites: favCount[t.id] ?? 0,
        comments: commentsByTrack[t.id] ?? [],
        coverImage: t.cover_image,
        audioUrl: t.audio_url,
      }));

      return json(200, { tracks: enriched });
    }

    if (action === "registerVoter") {
      const name = String(body?.name ?? "").trim();
      if (!name) return json(400, { error: "Missing name" });

      const { data: voter, error } = await supabase
        .from("voters")
        .insert({ name })
        .select("id,name")
        .single();

      if (error) throw error;

      return json(200, { voter: { id: voter.id, name: voter.name, votedTracks: [], favoriteTracks: [] } });
    }

    if (action === "vote") {
      const voterId = String(body?.voterId ?? "");
      const trackId = Number(body?.trackId);
      const isVoting = Boolean(body?.isVoting);

      if (!voterId || !Number.isFinite(trackId)) return json(400, { error: "Bad input" });

      if (isVoting) {
        const { error } = await supabase.from("votes").insert({ voter_id: voterId, track_id: trackId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("votes").delete().eq("voter_id", voterId).eq("track_id", trackId);
        if (error) throw error;
      }
      return json(200, { success: true });
    }

    if (action === "favorite") {
      const voterId = String(body?.voterId ?? "");
      const trackId = Number(body?.trackId);
      const isFavoriting = Boolean(body?.isFavoriting);

      if (!voterId || !Number.isFinite(trackId)) return json(400, { error: "Bad input" });

      if (isFavoriting) {
        const { error } = await supabase.from("favorites").insert({ voter_id: voterId, track_id: trackId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").delete().eq("voter_id", voterId).eq("track_id", trackId);
        if (error) throw error;
      }
      return json(200, { success: true });
    }

    if (action === "addComment") {
      const voterId = String(body?.voterId ?? "");
      const trackId = Number(body?.trackId);
      const text = String(body?.text ?? "").trim();
      const timestamp = Number(body?.timestamp ?? 0);

      if (!voterId || !Number.isFinite(trackId) || !text) return json(400, { error: "Bad input" });

      const { data: row, error } = await supabase
        .from("comments")
        .insert({ voter_id: voterId, track_id: trackId, text, timestamp })
        .select("id,text,timestamp,created_at,voters(name)")
        .single();

      if (error) throw error;

      return json(200, {
        comment: {
          id: row.id,
          voterName: (row as any).voters?.name ?? "Anon",
          text: row.text,
          timestamp: row.timestamp,
          createdAt: row.created_at,
        },
      });
    }

    if (action === "getRecentActivity") {
      // recent votes + favorites + comments (safe fields only)
      const limit = 30;

      const { data: recentVotes, error: rvErr } = await supabase
        .from("votes")
        .select("created_at,voters(name),tracks(title)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (rvErr) throw rvErr;

      const { data: recentFavs, error: rfErr } = await supabase
        .from("favorites")
        .select("created_at,voters(name),tracks(title)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (rfErr) throw rfErr;

      const { data: recentComments, error: rcErr } = await supabase
        .from("comments")
        .select("created_at,text,voters(name),tracks(title)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (rcErr) throw rcErr;

      const activities: any[] = [];

      for (const r of recentVotes ?? []) {
        const row: any = r;
        activities.push({ type: "vote", voterName: row.voters?.name ?? "Anon", trackTitle: row.tracks?.title ?? "Track", timestamp: row.created_at });
      }
      for (const r of recentFavs ?? []) {
        const row: any = r;
        activities.push({ type: "favorite", voterName: row.voters?.name ?? "Anon", trackTitle: row.tracks?.title ?? "Track", timestamp: row.created_at });
      }
      for (const r of recentComments ?? []) {
        const row: any = r;
        activities.push({ type: "comment", voterName: row.voters?.name ?? "Anon", trackTitle: row.tracks?.title ?? "Track", text: row.text, timestamp: row.created_at });
      }

      activities.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
      return json(200, { activities: activities.slice(0, limit) });
    }

    // ---------------------------
    // Admin actions
    // ---------------------------
    if (action === "adminLogin") {
      if (!isAdmin(body)) return json(401, { success: false });
      return json(200, { success: true });
    }

    if (!isAdmin(body)) return json(401, { error: "Unauthorized" });

    if (action === "adminGetTracks") {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw error;
      return json(200, { tracks: data ?? [] });
    }

    if (action === "adminCreateTrack") {
      const track = body?.track ?? {};
      const payload = {
        title: track.title ?? "Untitled",
        duration: track.duration ?? "",
        is_bonus: Boolean(track.is_bonus),
        edition: track.edition ?? "",
        emotional_tag: track.emotional_tag ?? "",
        cover_image: track.cover_image ?? "",
        audio_url: track.audio_url ?? "",
        sort_order: Number.isFinite(Number(track.sort_order)) ? Number(track.sort_order) : 0,
      };
      const { data, error } = await supabase.from("tracks").insert(payload).select("*").single();
      if (error) throw error;
      return json(200, { track: data });
    }

    if (action === "adminUpdateTrack") {
      const trackId = Number(body?.trackId);
      const updates = body?.updates ?? {};
      if (!Number.isFinite(trackId)) return json(400, { error: "Bad trackId" });

      const allowed = ["title","duration","is_bonus","edition","emotional_tag","cover_image","audio_url","sort_order"];
      const safe: any = {};
      for (const k of allowed) if (k in updates) safe[k] = updates[k];

      const { data, error } = await supabase.from("tracks").update(safe).eq("id", trackId).select("*").single();
      if (error) throw error;
      return json(200, { track: data });
    }

    if (action === "adminDeleteTrack") {
      const trackId = Number(body?.trackId);
      if (!Number.isFinite(trackId)) return json(400, { error: "Bad trackId" });

      // cascade delete related rows
      await supabase.from("votes").delete().eq("track_id", trackId);
      await supabase.from("favorites").delete().eq("track_id", trackId);
      await supabase.from("comments").delete().eq("track_id", trackId);
      const { error } = await supabase.from("tracks").delete().eq("id", trackId);
      if (error) throw error;
      return json(200, { success: true });
    }

    if (action === "adminGetStats") {
      const [{ count: votes }, { count: favs }, { count: comments }, { count: voters }] = await Promise.all([
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("favorites").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("voters").select("*", { count: "exact", head: true }),
      ]).then(results => results.map(r => ({ count: r.count ?? 0, error: r.error })));

      return json(200, { stats: { votes, favorites: favs, comments, voters } });
    }

    if (action === "adminGetSiteContent") {
      const { data, error } = await supabase.from("site_content").select("*").order("id", { ascending: true });
      if (error) throw error;
      return json(200, { content: data ?? [] });
    }

    if (action === "adminCreateSiteContent") {
      const item = body?.item ?? {};
      const payload = { key: item.key ?? "", value: item.value ?? "" };
      const { data, error } = await supabase.from("site_content").insert(payload).select("*").single();
      if (error) throw error;
      return json(200, { item: data });
    }

    if (action === "adminUpdateSiteContent") {
      const id = Number(body?.id);
      const updates = body?.updates ?? {};
      if (!Number.isFinite(id)) return json(400, { error: "Bad id" });
      const { data, error } = await supabase.from("site_content").update({ key: updates.key, value: updates.value }).eq("id", id).select("*").single();
      if (error) throw error;
      return json(200, { item: data });
    }

    if (action === "adminDeleteSiteContent") {
      const id = Number(body?.id);
      if (!Number.isFinite(id)) return json(400, { error: "Bad id" });
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
      return json(200, { success: true });
    }

    if (action === "adminCreateSignedUpload") {
      const bucket = String(body?.bucket ?? "");
      const folder = String(body?.folder ?? "").trim();
      const fileName = sanitizeName(String(body?.fileName ?? "file"));
      const contentType = String(body?.contentType ?? "application/octet-stream");
      if (!bucket) return json(400, { error: "Missing bucket" });

      const path = `${folder ? folder.replace(/\/+$/,"") + "/" : ""}${Date.now()}-${fileName}`;

      const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path, { upsert: true, contentType });
      if (error) throw error;

      return json(200, { bucket, path, token: data.token });
    }

    return json(400, { error: `Unknown action: ${action}` });
  } catch (e: any) {
    return json(500, { error: e?.message ?? String(e) });
  }
});
