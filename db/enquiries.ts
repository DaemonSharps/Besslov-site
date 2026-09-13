import { env } from "cloudflare:workers";
import type { Enquiry } from "@/lib/enquiry-validation";
export async function saveEnquiry(value: Enquiry) {
  if (!env.DB) throw new Error("Enquiry storage is unavailable");
  await env.DB.prepare("INSERT INTO enquiries (id, name, contact, chaos, format, consent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING")
    .bind(value.id,value.name,value.contact,value.chaos,value.format,1,new Date().toISOString()).run();
}
