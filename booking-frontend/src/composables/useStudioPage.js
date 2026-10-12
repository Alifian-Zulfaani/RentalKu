import { onMounted, ref } from "vue";
import { api, apiError, siteContext } from "../services/api";

export function useStudioPage(title) {
  const site = ref(null);
  const error = ref("");
  onMounted(async () => {
    try {
      const response = await api.get("/public/site", {
        params: { tenant: siteContext().tenant },
      });
      site.value = response.data;
      document.title = `${title} | ${site.value.tenant.name}`;
    } catch (cause) {
      error.value = apiError(cause);
    }
  });
  return { site, error };
}
