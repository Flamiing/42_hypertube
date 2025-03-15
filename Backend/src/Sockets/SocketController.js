// Third-Party Imports:
import { Filter } from 'bad-words';

// Local Imports:
import textChatMessagesModel from '../Models/TextChatMessagesModel.js';
import userStatusModel from '../Models/UserStatusModel.js';
import {
    changeChatUpdatedAtTimestamp,
    processAudioMessage,
} from '../Utils/chatUtils.js';
import { emitErrorAndReturnNull } from '../Utils/errorUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { getTimestampWithTZ } from '../Utils/timeUtils.js';
import { validateMessagePayload } from '../Validations/messagePayloadValidations.js';
import Notifications from './Notifications.js';

export default class SocketController {
    static async sendTextMessage(io, socket, data) {
        const validPayload = await validateMessagePayload(socket, data, 'text');
        if (!validPayload) return;

        const filter = new Filter();
        const senderId = socket.request.session.user.id;
        const chatMessage = {
            chat_id: validPayload.chatId,
            sender_id: senderId,
            receiver_id: validPayload.receiverId,
            message: filter.clean(validPayload.message),
            created_at: validPayload.createdAt,
        };
        const savedChatMessage = await textChatMessagesModel.create({
            input: chatMessage,
        });
        if (!savedChatMessage || savedChatMessage.length === 0)
            return emitErrorAndReturnNull(
                socket,
                StatusMessage.FAILED_SENDING_CHAT_MESSAGE
            );

        const receiverUser = await userStatusModel.getByReference(
            { user_id: validPayload.receiverId },
            true
        );
        if (!receiverUser)
            return emitErrorAndReturnNull(
                socket,
                StatusMessage.FAILED_SENDING_CHAT_MESSAGE
            );

        const chatUpdateResult = await changeChatUpdatedAtTimestamp(
            validPayload.chatId
        );
        if (!chatUpdateResult)
            return emitErrorAndReturnNull(
                socket,
                StatusMessage.FAILED_SENDING_CHAT_MESSAGE
            );

        await Notifications.sendNotification(
            'message',
            validPayload.receiverId,
            senderId
        );

        const payload = {
            senderId: senderId,
            message: validPayload.message,
            createdAt: validPayload.createdAt,
            type: 'text',
        };

        io.to(receiverUser.socket_id).emit('message', payload);
    }

    static async sendAudioMessage(io, socket, data) {
        const validPayload = await validateMessagePayload(socket, data);
        if (!validPayload) return;

        const senderId = socket.request.session.user.id;

        const audioPath = await processAudioMessage(
            socket,
            senderId,
            validPayload
        );
        if (!audioPath) return null;

        const receiverUser = await userStatusModel.getByReference(
            { user_id: validPayload.receiverId },
            true
        );
        if (!receiverUser)
            return emitErrorAndReturnNull(
                socket,
                StatusMessage.FAILED_SENDING_CHAT_MESSAGE
            );

        await Notifications.sendNotification(
            'message',
            validPayload.receiverId,
            senderId
        );

        const payload = {
            senderId: senderId,
            message: audioPath,
            createdAt: validPayload.createdAt,
            type: 'audio',
        };
        io.to(receiverUser.socket_id).emit('message', payload);
    }

    static async changeUserStatus(socket, status) {
        const userId = socket.request.session.user.id;
        let socketId = null;
        if (status === 'online') socketId = socket.id;

        const input = {
            user_id: userId,
            socket_id: socketId,
            status: status,
            last_online: getTimestampWithTZ(),
        };

        const userStatus = await userStatusModel.createOrUpdate({
            input,
            keyName: 'user_id',
        });
        if (!userStatus || userStatus.length === 0) return false;

        console.info('INFO:', StatusMessage.USER_STATUS_CHANGED);
        return true;
    }
}
