import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(localStorage.getItem("theme") !== "light");

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  // Watch for changes and apply to DOM/localStorage
  watch(
    isDark,
    (dark) => {
      const theme = dark ? "dark" : "light";
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    },
    { immediate: true },
  );

  return { isDark, toggleTheme };
});
