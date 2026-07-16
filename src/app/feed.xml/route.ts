import { permanentRedirect } from "next/navigation";

export function GET() {
  permanentRedirect("/fr/feed.xml");
}
