import { cn } from "@/lib/utils";

export function CmsHtml({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("cms-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
