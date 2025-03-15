import apiRequest from "./config";

export const notificationsApi = {
	getAllNotifications: async (): Promise<{ msg }> => {
		const response = await apiRequest("notifications");
		return response;
	},

	markAllAsRead: async (): Promise<{ msg }> => {
		const response = await apiRequest("notifications/mark-read", {
			method: "PATCH",
		});
		return response;
	},
};
