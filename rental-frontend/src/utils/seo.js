function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function updateSeo({
  title = "Summit Gear | Rental Peralatan Outdoor",
  description = "Sewa peralatan outdoor yang terawat dengan proses booking yang ringkas.",
  noindex = false,
  path = window.location.pathname,
  favicon = "/favicon.svg?v=3",
} = {}) {
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);

  let icon = document.head.querySelector('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.type = /\.svg(?:\?|$)/i.test(favicon) ? "image/svg+xml" : "image/x-icon";
  icon.href = favicon;

  const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = siteUrl ? `${siteUrl}${path}` : window.location.href;
}
