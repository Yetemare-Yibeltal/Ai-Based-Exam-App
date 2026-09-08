const PREFIX = "heroy_";

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(`${PREFIX}${key}`);
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  },

  clear: () => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(PREFIX),
      );
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },

  setSession: (key, value) => {
    try {
      sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error("Session storage set error:", error);
    }
  },

  getSession: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(`${PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Session storage get error:", error);
      return defaultValue;
    }
  },

  removeSession: (key) => {
    try {
      sessionStorage.removeItem(`${PREFIX}${key}`);
    } catch (error) {
      console.error("Session storage remove error:", error);
    }
  },
};

export const TOKEN_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  ROLE: "role",
};

export const tokenStorage = {
  setTokens: (accessToken, refreshToken) => {
    storage.set(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  },

  getAccessToken: () => storage.get(TOKEN_KEYS.ACCESS_TOKEN),
  getRefreshToken: () => storage.get(TOKEN_KEYS.REFRESH_TOKEN),

  setUser: (user) => storage.set(TOKEN_KEYS.USER, user),
  getUser: () => storage.get(TOKEN_KEYS.USER),

  setRole: (role) => storage.set(TOKEN_KEYS.ROLE, role),
  getRole: () => storage.get(TOKEN_KEYS.ROLE),

  clearAll: () => {
    storage.remove(TOKEN_KEYS.ACCESS_TOKEN);
    storage.remove(TOKEN_KEYS.REFRESH_TOKEN);
    storage.remove(TOKEN_KEYS.USER);
    storage.remove(TOKEN_KEYS.ROLE);
  },

  isLoggedIn: () => !!storage.get(TOKEN_KEYS.ACCESS_TOKEN),
};

export const quizStorage = {
  saveProgress: (sessionId, data) =>
    storage.setSession(`quiz_${sessionId}`, data),
  getProgress: (sessionId) => storage.getSession(`quiz_${sessionId}`),
  clearProgress: (sessionId) => storage.removeSession(`quiz_${sessionId}`),
};

export const settingsStorage = {
  setTheme: (theme) => storage.set("theme", theme),
  getTheme: () => storage.get("theme", "light"),
  setLanguage: (lang) => storage.set("language", lang),
  getLanguage: () => storage.get("language", "en"),
};
