// Local Imports:
import notificationsModel from '../Models/NotificationsModel.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class NotificationsController {
    static async getAllNotifications(req, res) {
        const userId = req.session.user.id;

        const rawNotifications = await notificationsModel.getByReference(
            {
                user_id: userId,
            },
            false
        );
        if (!rawNotifications)
            return res
                .status(500)
                .json({ msg: StatusMessage.ERROR_FETCHING_NOTIFICATIONS });
        if (rawNotifications.length === 0) return res.json({ msg: [] });

        const notifications =
            NotificationsController.getNotificationsInfo(rawNotifications);
        if (!notifications)
            return res
                .status(500)
                .json({ msg: StatusMessage.ERROR_FETCHING_NOTIFICATIONS });

        return res.json({ msg: notifications });
    }

    static getNotificationsInfo(rawNotifications) {
        let notifications = [];
        for (const rawNotification of rawNotifications) {
            const notification = {
                id: rawNotification.id,
                message: rawNotification.message,
                read: rawNotification.read,
                createdAt: rawNotification.created_at,
            };

            notifications.push(notification);
        }

        const sortedNotifications =
            NotificationsController.sortNotificationsByNewest(notifications);
        return sortedNotifications;
    }

    static sortNotificationsByNewest(notifications) {
        try {
            return notifications.sort((a, b) => {
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
            });
        } catch (error) {
            console.error('ERROR:', error);
            return null;
        }
    }

    static async markRead(req, res) {
        const userId = req.session.user.id;

        const updateResult = notificationsModel.updateReadStatus(userId, true);
        if (!updateResult)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        return res.json({});
    }
}
