import { create } from "zustand";
import { settingsStorage } from "../utils/storage";

const useUIStore = create((set, get) => ({
  theme: settingsStorage.getTheme(),
  language: settingsStorage.getLanguage(),
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isLoading: false,
  globalLoading: false,
  modal: { isOpen: false, type: null, data: null },
  notifications: [],
  unreadCount: 0,
  breadcrumbs: [],

  setTheme: (theme) => {
    settingsStorage.setTheme(theme);
    set({ theme });
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === "dark" ? "light" : "dark";
    get().setTheme(newTheme);
  },

  setLanguage: (language) => {
    settingsStorage.setLanguage(language);
    set({ language });
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  openModal: (type, data = null) =>
    set({ modal: { isOpen: true, type, data } }),
  closeModal: () => set({ modal: { isOpen: false, type: null, data: null } }),

  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnreadCount: () => set({ unreadCount: 0 }),

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  addBreadcrumb: (crumb) =>
    set((state) => ({ breadcrumbs: [...state.breadcrumbs, crumb] })),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));

export default useUIStore;
