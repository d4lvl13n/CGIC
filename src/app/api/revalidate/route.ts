import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  event: z.string().min(1),
  postType: z.enum(["job", "post", "taxonomy"]),
  postId: z.number().int().positive().optional(),
  locale: z.enum(["fr", "en", "nl"]).optional(),
  taxonomy: z.string().optional(),
  modifiedAt: z.string().optional(),
});

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.WORDPRESS_WEBHOOK_SIGNING_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  const timestamp = request.headers.get("x-cgic-timestamp");
  const signature = request.headers.get("x-cgic-signature")?.replace(/^sha256=/, "");
  if (!timestamp || !signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });

  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return NextResponse.json({ error: "Expired webhook" }, { status: 401 });
  }

  const body = await request.text();
  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  if (!secureEqual(expected, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let payload: z.infer<typeof payloadSchema>;
  try {
    payload = payloadSchema.parse(JSON.parse(body));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const tags = new Set<string>(["wordpress"]);
  if (payload.postType === "job") {
    tags.add("jobs");
    if (payload.postId) tags.add(`job:${payload.postId}`);
    revalidatePath("/[locale]/jobs", "page");
  } else if (payload.postType === "post") {
    tags.add("articles");
    if (payload.postId) tags.add(`article:${payload.postId}`);
    revalidatePath("/[locale]/insights", "page");
    revalidatePath("/[locale]/feed.xml", "page");
  } else {
    tags.add("jobs");
    tags.add("articles");
  }

  for (const tag of tags) revalidateTag(tag, "max");
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ revalidated: true, tags: [...tags] });
}
