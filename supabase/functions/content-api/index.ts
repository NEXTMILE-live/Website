import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  // Extract the sub-path after the function name, regardless of prefix format.
  // Handles: /functions/v1/content-api/X, /content-api/X, or just /X
  const fnMatch = pathname.match(/\/content-api\/(.*)/);
  const path = fnMatch ? fnMatch[1] : pathname.replace(/^\/+/, "");
  const segments = path.split("/").filter(Boolean);
  const resource = segments[0] || "";

  try {
    // ── Content ──
    if (resource === "content") {
      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("site_content")
          .select("key, value")
          .order("key");
        if (error) return jsonError(error.message, 400);
        return jsonResponse(data || []);
      }

      if (req.method === "POST") {
        const body = await req.json();
        const entries = body.entries;
        if (!Array.isArray(entries)) return jsonError("Expected { entries: [...] }");

        for (const entry of entries) {
          const { error: upsertError } = await supabase
            .from("site_content")
            .upsert(
              {
                key: entry.key,
                value: entry.value,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "key" }
            );
          if (upsertError) return jsonError(upsertError.message, 400);
        }
        return jsonResponse({ success: true });
      }
    }

    // ── Giveaway Entries (free) ──
    if (resource === "entries") {
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("giveaway_entries").insert({
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          city: body.city || null,
          state: body.state || null,
        });
        if (error) {
          if (error.code === "23505") return jsonError("duplicate", 409);
          return jsonError(error.message, 400);
        }
        return jsonResponse({ success: true });
      }

      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("giveaway_entries")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonError(error.message, 400);
        return jsonResponse(data || []);
      }

      if (req.method === "DELETE") {
        const id = segments[1];
        if (!id) return jsonError("Missing entry id");
        const { error } = await supabase.from("giveaway_entries").delete().eq("id", id);
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }
    }

    // ── Paid Entries (from product purchases) ──
    if (resource === "paid-entries") {
      if (req.method === "POST") {
        const body = await req.json();
        if (!body.email || !body.full_name || !body.product_id || !body.entry_count) {
          return jsonError("Missing required fields: email, full_name, product_id, entry_count");
        }
        const { error } = await supabase.from("paid_entries").insert({
          email: body.email,
          full_name: body.full_name,
          product_id: body.product_id,
          product_name: body.product_name || "",
          price: body.price || "",
          entry_count: body.entry_count,
          order_id: body.order_id || null,
        });
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }

      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("paid_entries")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonError(error.message, 400);
        return jsonResponse(data || []);
      }

      if (req.method === "DELETE") {
        const id = segments[1];
        if (!id) return jsonError("Missing paid entry id");
        const { error } = await supabase.from("paid_entries").delete().eq("id", id);
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }
    }

    // ── All Entries (combined free + paid for admin dashboard) ──
    if (resource === "all-entries") {
      if (req.method === "GET") {
        const [freeRes, paidRes] = await Promise.all([
          supabase.from("giveaway_entries").select("*").order("created_at", { ascending: false }),
          supabase.from("paid_entries").select("*").order("created_at", { ascending: false }),
        ]);

        if (freeRes.error) return jsonError(freeRes.error.message, 400);
        if (paidRes.error) return jsonError(paidRes.error.message, 400);

        const freeEntries = (freeRes.data || []).map((e: Record<string, unknown>) => ({
          ...e,
          entry_type: "free" as const,
          entry_count: 1,
          product_name: null as string | null,
          source: "Free Entry" as const,
        }));

        const paidEntries = (paidRes.data || []).map((e: Record<string, unknown>) => ({
          ...e,
          entry_type: "paid" as const,
          source: e.product_name as string,
        }));

        const combined = [...freeEntries, ...paidEntries].sort(
          (a: Record<string, unknown>, b: Record<string, unknown>) =>
            new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
        );

        return jsonResponse(combined);
      }
    }

    // ── Car Donations ──
    if (resource === "donations") {
      if (req.method === "POST") {
        const body = await req.json();
        const { error } = await supabase.from("car_donations").insert({
          year: body.year,
          make: body.make,
          model: body.model,
          mileage: body.mileage,
          clean_title: body.clean_title,
          runs_and_drives: body.runs_and_drives,
          no_accidents: body.no_accidents,
          up_to_date_maintenance: body.up_to_date_maintenance,
          notes: body.notes || null,
          donor_name: body.donor_name,
          donor_email: body.donor_email,
          donor_phone: body.donor_phone || null,
          city: body.city || null,
          state: body.state || null,
        });
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }

      if (req.method === "GET") {
        const { data, error } = await supabase
          .from("car_donations")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return jsonError(error.message, 400);
        return jsonResponse(data || []);
      }

      if (req.method === "PUT") {
        const id = segments[1];
        if (!id) return jsonError("Missing donation id");
        const body = await req.json();
        const updates: Record<string, unknown> = {};
        if (body.status !== undefined) updates.status = body.status;
        const { error } = await supabase.from("car_donations").update(updates).eq("id", id);
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }

      if (req.method === "DELETE") {
        const id = segments[1];
        if (!id) return jsonError("Missing donation id");
        const { error } = await supabase.from("car_donations").delete().eq("id", id);
        if (error) return jsonError(error.message, 400);
        return jsonResponse({ success: true });
      }
    }

    // ── Upload (signed URL for storage) ──
    if (resource === "upload" && req.method === "POST") {
      const body = await req.json();
      const { fileName, contentType, fileData } = body;
      if (!fileName || !contentType || !fileData) {
        return jsonError("Missing fileName, contentType, or fileData");
      }
      const base64 = fileData.split(",")[1] || fileData;
      const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("site-assets")
        .upload(fileName, buffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) return jsonError(uploadError.message, 400);

      const { data: urlData } = supabase
        .storage
        .from("site-assets")
        .getPublicUrl(fileName);

      return jsonResponse({ url: urlData.publicUrl, path: uploadData?.path });
    }

    return jsonError("Not found", 404);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : String(err), 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
