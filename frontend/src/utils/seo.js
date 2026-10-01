const defaultTitle = "RentalKu | Aplikasi Rental dan Booking untuk Bisnis Indonesia";
const defaultDescription =
  "RentalKu membantu bisnis rental dan jasa mengelola pesanan, pelanggan, inventaris, serta jadwal dalam satu ekosistem.";

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

export function updateSeo(route) {
  const seo = route.meta.seo || {};
  const title = seo.title || defaultTitle;
  const description = seo.description || defaultDescription;
  const isPrivate = Boolean(seo.noindex);
  const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");

  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", isPrivate ? "noindex, nofollow" : "index, follow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", siteUrl ? `${siteUrl}${route.path}` : window.location.href);
}
