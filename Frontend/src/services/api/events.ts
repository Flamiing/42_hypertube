import apiRequest from "./config";

export const eventsApi = {
	getUserEvents: async () => {
		const response = await apiRequest(`events`);
		return response;
	},
	createEvent: async (eventData: any) => {
		const response = await apiRequest(`events`, {
			method: "POST",
			body: JSON.stringify(eventData),
		});
		return response;
	},
	deleteEvent: async (eventId: string) => {
		const response = await apiRequest(`events/${eventId}`, {
			method: "DELETE",
		});
		return response;
	},
};
