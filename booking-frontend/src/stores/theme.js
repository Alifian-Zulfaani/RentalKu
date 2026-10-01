import { ref, watch } from "vue";

const storageKey = "booking_theme";
const preferredTheme = localStorage.getItem(storageKey);
const isDark = ref(
  preferredTheme
    ? preferredTheme === "dark"
    : window.matchMedia?.("(prefers-color-scheme: dark)").matches === true,
);

watch(
  isDark,
  (dark) => {
    const theme = dark ? "dark" : "light";
    localStorage.setItem(storageKey, theme);
    document.documentElement.dataset.theme = theme;
  },
  { immediate: true },
);

export function useThemeStore() {
  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  return { isDark, toggleTheme };
}
