// Local Imports:
import likesModel from '../Models/LikesModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { emitErrorAndReturnNull } from '../Utils/errorUtils.js';
import { validateTextMessage } from '../Schemas/textMessageSchema.js';
import { validateUserId } from '../Validations/blockedUsersValidations.js';
import { validateAudioMessage } from '../Schemas/audioMessageSchema.js';
import chatsModel from '../Models/ChatsModel.js';
import { getTimestampWithTZ } from '../Utils/timeUtils.js';

export async function validateMessagePayload(socket, payload, msgType) {
    const senderId = socket.request.session.user.id;

    const { receiverId, chatId } = payload;
    if (!receiverId || !chatId)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.INVALID_MESSAGE_PAYLOAD
        );

    const validatedMessage = validateMessage(socket, payload, msgType);
    if (!validatedMessage) return null;

    if (!(await validateUserId(receiverId)))
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.INVALID_RECEIVER_ID
        );

    const isMatch = await likesModel.checkIfMatch(senderId, receiverId);
    if (isMatch === null)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.ERROR_CHECKING_MATCH
        );
    else if (!isMatch)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.CANNOT_SEND_MESSAGE_WITHOUT_MATCH
        );

    if (!(await isValidChat(socket, chatId, senderId, receiverId))) return null;

    const validPayload = {
        chatId: chatId,
        receiverId: receiverId,
        message: validatedMessage.message,
        createdAt: getTimestampWithTZ(),
    };

    return validPayload;
}

function validateMessage(socket, payload, msgType) {
    if (msgType === 'text') {
        const validatedMessage = validateTextMessage(payload);
        if (!validatedMessage.success) {
            const errorMessage = validatedMessage.error.errors[0].message;
            return emitErrorAndReturnNull(socket, errorMessage);
        }
        return validatedMessage.data;
    }

    const validatedMessage = validateAudioMessage(payload);
    if (!validatedMessage.success) {
        const errorMessage = validatedMessage.error.errors[0].message;
        return emitErrorAndReturnNull(socket, errorMessage);
    }
    return validatedMessage.data;
}

async function isValidChat(socket, chatId, senderId, receiverId) {
    const chat = await chatsModel.getById({ id: chatId });
    if (!chat || chat.length === 0)
        return emitErrorAndReturnNull(socket, StatusMessage.CHAT_NOT_FOUND);

    if (
        (chat.user_id_1 === senderId && chat.user_id_2 === receiverId) ||
        (chat.user_id_1 === receiverId && chat.user_id_2 === senderId)
    )
        return true;

    return emitErrorAndReturnNull(socket, StatusMessage.NOT_CHAT_PARTICIPANT);
}
