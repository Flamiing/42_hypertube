import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../../services/api/notifications";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

interface Notification {
	id: string;
	message: string;
	read: boolean;
	createdAt: string;
}

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const { socket } = useSocket();
	const { user } = useAuth();

	const getAllNotifications = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await notificationsApi.getAllNotifications();
			// sort notifications by date
			setNotifications(
				response.msg.sort(
					(a: Notification, b: Notification) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
				)
			);
			updateUnreadCount(response.msg);
			return response.msg;
		} catch (err: any) {
			const errorMessage = err.message
				? err.message
				: "Failed to get notifications";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const markAllAsRead = async () => {
		try {
			await notificationsApi.markAllAsRead();
			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, read: true }))
			);
			setUnreadCount(0);
			return true;
		} catch (err: any) {
			const errorMessage = err.message
				? err.message
				: "Failed to mark notifications as read";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	const updateUnreadCount = (notificationsList: Notification[]) => {
		const count = notificationsList.filter(
			(notification) => !notification.read
		).length;
		setUnreadCount(count);
	};

	useEffect(() => {
		if (!socket) return;

		socket.on("notification", (notification: Notification) => {
			setNotifications((prev) => [notification, ...prev]);
			setUnreadCount((prev) => prev + 1);
		});

		return () => {
			socket.off("notification");
		};
	}, [socket]);

	return {
		notifications,
		unreadCount,
		getAllNotifications,
		markAllAsRead,
		loading,
		error,
	};
};
