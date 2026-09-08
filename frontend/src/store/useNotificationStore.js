import { create } from "zustand";
import axiosInstance from "../api/axios";
import { API_ENDPOINTS } from "../constants/api";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 1,
  hasMore: true,
  total: 0,

  fetchNotifications: async (page = 1, unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        params: { page, limit: 20, unreadOnly },
      });

      const { data, pagination } = res.data;
      const newNotifications =
        page === 1 ? data : [...get().notifications, ...data];

      set({
        notifications: newNotifications,
        unreadCount: res.data.extra?.unreadCount || 0,
        total: pagination?.total || 0,
        hasMore: pagination ? page < pagination.pages : false,
        page,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
      );
      set({ unreadCount: res.data.data.unreadCount || 0 });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        total: state.total - 1,
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  },

  deleteAll: async () => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
      set({ notifications: [], unreadCount: 0, total: 0 });
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  loadMore: async () => {
    const { page, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    await get().fetchNotifications(page + 1);
  },

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      page: 1,
      hasMore: true,
      total: 0,
    }),
}));

export default useNotificationStore;
