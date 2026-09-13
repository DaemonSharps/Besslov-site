import type { Enquiry } from "@/lib/enquiry-validation";

export async function saveEnquiry(value: Enquiry) {
  let env: { DB?: { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown> } } } };
  try {
    ({ env } = await import("cloudflare:workers"));
  } catch {
    throw new Error("Enquiry storage is unavailable");
  }
  if (!env.DB) throw new Error("Enquiry storage is unavailable");
  await env.DB.prepare("INSERT INTO enquiries (id, name, contact, chaos, format, consent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
    .bind(value.id, value.name, value.contact, value.chaos, value.format, 1, new Date().toISOString()).run();
}
