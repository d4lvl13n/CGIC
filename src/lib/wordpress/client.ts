const DEFAULT_REVALIDATE_SECONDS = 300;

export function isWordPressConfigured() {
  return Boolean(process.env.WORDPRESS_API_URL);
}

function getApiBase() {
  const raw = process.env.WORDPRESS_API_URL;
  if (!raw) {
    throw new Error("WORDPRESS_API_URL is not configured");
  }
  return raw.replace(/\/$/, "");
}

export async function wpFetch(
  path: string,
  tags: string[],
  init?: RequestInit,
) {
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    next: {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: ["wordpress", ...tags],
    },
  });

  if (!response.ok) {
    throw new Error(`WordPress request failed (${response.status}) for ${path}`);
  }

  return response;
}
