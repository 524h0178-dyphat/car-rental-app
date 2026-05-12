import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggleDark: () => {
        const next = !get().isDark;
        set({ isDark: next });
        // Apply to <html> element for Tailwind `class` dark mode strategy
        document.documentElement.classList.toggle('dark', next);
      },
    }),
    {
      name: 'skibidicar-theme',
      onRehydrateStorage: () => (state) => {
        // Restore dark class on page load
        if (state?.isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
