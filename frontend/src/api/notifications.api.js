import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const notificationsAPI = {
  getNotifications: (params) =>
    axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params }),

  getUnreadCount: () =>
    axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),

  markAsRead: (id) =>
    axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  markAllAsRead: () =>
    axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),

  deleteNotification: (id) =>
    axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),

  deleteAll: () => axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL),
};

export default notificationsAPI;
