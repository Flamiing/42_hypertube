import { useState } from "react";
import { eventsApi } from "../../services/api/events";

export const useEvents = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getUserEvents = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await eventsApi.getUserEvents();
			return response.msg;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Could not get events";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const createEvent = async (eventData: any) => {
		setLoading(true);
		setError(null);
		try {
			const response = await eventsApi.createEvent(eventData);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to create event";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const deleteEvent = async (eventId: string) => {
		setLoading(true);
		setError(null);
		try {
			const response = await eventsApi.deleteEvent(eventId);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to delete event";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return {
		getUserEvents,
		createEvent,
		deleteEvent,
		loading,
		error,
	};
};
