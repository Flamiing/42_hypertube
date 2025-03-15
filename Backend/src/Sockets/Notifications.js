// Local Imports:
import blockedUsersModel from '../Models/BlockedUsersModel.js';
import dislikesModel from '../Models/DislikesModel.js';
import notificationsModel from '../Models/NotificationsModel.js';
import userModel from '../Models/UserModel.js';
import userStatusModel from '../Models/UserStatusModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { getTimestampWithTZ } from '../Utils/timeUtils.js';
import SocketHandler from './SocketHandler.js';

export default class Notifications {
    static NOTIFICATIONS = {
        message: this.#messageNotification,
        like: this.#likeNotification,
        view: this.#viewNotification,
        match: this.#matchNotification,
        'like-removed': this.#likeRemovedNotification,
    };

    static async sendNotification(notificationType, recipientId, notifierId) {
        const isUserBlocked = await blockedUsersModel.isUserBlocked(
            recipientId,
            notifierId
        );
        if (isUserBlocked) return null;

        const isUserDisliked = await dislikesModel.isUserDisliked(
            recipientId,
            notifierId
        );
        if (isUserDisliked) return null;

        const recipientInfo = await this.#getUserInfo(recipientId, 'status');
        if (!recipientInfo) return null;
        const notifierInfo = await this.#getUserInfo(notifierId, 'full');
        if (!notifierInfo) return null;

        const notificationMessage = this.NOTIFICATIONS[notificationType](
            notifierInfo.username
        );
        const notification = await notificationsModel.create({
            input: {
                user_id: recipientId,
                message: notificationMessage,
                created_at: getTimestampWithTZ(),
            },
        });
        if (!notification || notification.length === 0) {
            console.log(
                'ERROR:',
                StatusMessage.ERROR_SAVING_NOTIFICATION_TO_DB
            );
            return null;
        }

        const payload = {
            id: notification.id,
            message: notification.message,
            read: notification.read,
            createdAt: notification.created_at,
        };

        const socketHandler = SocketHandler.getInstance();
        const io = socketHandler.getIo();
        io.to(recipientInfo.socketId).emit('notification', payload);
    }

    static #messageNotification(notifierUsername) {
        return `${notifierUsername} sent you a message! 💬`;
    }

    static #likeNotification(notifierUsername) {
        return `${notifierUsername} just liked you! 💖`;
    }

    static #viewNotification(notifierUsername) {
        return `${notifierUsername} just checked out your profile! 👀`;
    }

    static #matchNotification(notifierUsername) {
        return `${notifierUsername} just liked you back! It's a match! 💘`;
    }

    static #likeRemovedNotification(notifierUsername) {
        return `😔 Oh no, ${notifierUsername} unliked you. But hey, you’re still awesome! 💪`;
    }

    static async #getUserInfo(userId, infoType) {
        let userData = null;
        let userStatus = null;

        if (infoType === 'data' || infoType === 'full') {
            userData = await userModel.getById({ id: userId });
            if (!userData) {
                console.error('ERROR:', StatusMessage.COULD_NOT_GET_USER);
                return null;
            } else if (userData.length === 0) {
                console.info('INFO:', StatusMessage.USER_NOT_FOUND);
                return null;
            }
        }

        if (infoType === 'status' || infoType === 'full') {
            userStatus = await userStatusModel.getByReference(
                {
                    user_id: userId,
                },
                true
            );
            if (!userStatus) {
                console.error(
                    'ERROR:',
                    StatusMessage.COULD_NOT_GET_USER_STATUS
                );
                return null;
            } else if (userStatus.length === 0) {
                console.info('INFO:', StatusMessage.USER_STATUS_NOT_FOUND);
                return null;
            }
        }

        const userInfo = {
            id: userData ? userData.id : null,
            username: userData ? userData.username : null,
            socketId: userStatus ? userStatus.socket_id : null,
        };

        return userInfo;
    }
}
