import { enquirySchema } from "@/lib/enquiry-validation";
import { saveEnquiry } from "@/db/enquiries";
export async function POST(request: Request) {
  const headers = {"Cache-Control":"no-store"};
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({error:"Отправь заявку с этой страницы."},{status:403,headers});
  if (!request.headers.get("content-type")?.startsWith("application/json")) return Response.json({error:"Неизвестный формат заявки."},{status:415,headers});
  if (Number(request.headers.get("content-length")||0)>4096) return Response.json({error:"Слишком длинная заявка."},{status:413,headers});
  let value;
  try {
    const text = await request.text();
    if (text.length>4096) return Response.json({error:"Слишком длинная заявка."},{status:413,headers});
    value = enquirySchema.safeParse(JSON.parse(text));
  } catch { return Response.json({error:"Не удалось прочитать заявку. Попробуй ещё раз."},{status:400,headers}); }
  if(!value.success) return Response.json({error:value.error.issues.find(issue=>issue.path[0]==="contact")?.message || "Проверь имя, контакт, уровень хаоса и согласие."},{status:400,headers});
  try { await saveEnquiry(value.data); return Response.json({ok:true,id:value.data.id},{status:201,headers}); }
  catch { console.error("Failed to save enquiry"); return Response.json({error:"Не удалось сохранить заявку. Данные остались в форме — попробуй ещё раз чуть позже."},{status:503,headers}); }
}
