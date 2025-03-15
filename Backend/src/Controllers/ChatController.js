// Local Imports:
import chatsModel from '../Models/ChatsModel.js';
import audioChatMessagesModel from '../Models/AudioChatMessagesModel.js';
import textChatMessagesModel from '../Models/TextChatMessagesModel.js';
import userModel from '../Models/UserModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';

export default class ChatController {
    static async getAllChats(req, res) {
        const { id } = req.session.user;

        let reference = {
            user_id_1: id,
        };

        const chatsOne = await chatsModel.getByReference(reference, false);
        if (!chatsOne)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        reference = {
            user_id_2: id,
        };

        const chatsTwo = await chatsModel.getByReference(reference, false);
        if (!chatsTwo)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        const rawChats = [...chatsOne, ...chatsTwo];
        if (rawChats.length === 0) return res.json({ msg: [] });

        const chats = await ChatController.getChatsInfo(id, rawChats);
        if (!chats)
            return res
                .status(500)
                .json({ msg: StatusMessage.ERROR_GETTING_CHATS_INFO });

        return res.json({ msg: chats });
    }

    static async getChatById(req, res) {
        const chatId = req.params.id;
        const senderId = req.session.user.id;

        const rawChat = await chatsModel.getById({ id: chatId });
        if (!rawChat)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (rawChat.length === 0)
            return res.status(404).json({ msg: StatusMessage.CHAT_NOT_FOUND });

        const chatMessages = await ChatController.getAllChatMessages(
            res,
            chatId,
            senderId
        );
        if (!chatMessages) return res;

        const chat = {
            chatId: chatId,
            senderId: senderId,
            receiverId:
                senderId !== rawChat.user_id_1
                    ? rawChat.user_id_1
                    : rawChat.user_id_2,
            chatMessages: chatMessages.length === 0 ? [] : chatMessages,
        };

        return res.json({ msg: chat });
    }

    static async getAllChatMessages(res, chatId, senderId) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        const textMessages = await textChatMessagesModel.getByReference(
            { chat_id: chatId },
            false
        );
        if (!textMessages)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        const audioMessages = await audioChatMessagesModel.getByReference(
            { chat_id: chatId },
            false
        );
        if (!audioMessages)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        const rawMessages = [...textMessages, ...audioMessages];
        let messages = [];
        for (const rawMessage of rawMessages) {
            const type = !rawMessage.message ? 'audio' : 'text';
            let audioURL = null;
            if (type === 'audio') {
                const audioId = rawMessage.audio_path
                    .split('/')
                    .pop()
                    .replace(/\.mp3$/i, '');
                audioURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/media/audio/${audioId}`;
            }

            const message = {
                senderId: rawMessage.sender_id,
                message: audioURL ? audioURL : rawMessage.message,
                createdAt: rawMessage.created_at,
                type: type,
            };

            messages.push(message);
        }

        const sortedMessages = this.sortMessagesByOldest(messages);
        return sortedMessages;
    }

    static async getChatsInfo(userId, rawChats) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        let chats = [];

        for (const rawChat of rawChats) {
            const receiverId =
                userId !== rawChat.user_id_1
                    ? rawChat.user_id_1
                    : rawChat.user_id_2;
            const profilePicture = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${receiverId}/profile-picture`;
            const receiverUser = await userModel.getById({ id: receiverId });
            if (!receiverUser || receiverUser.length === 0) return null;

            const chat = {
                chatId: rawChat.id,
                receiverId: receiverId,
                receiverUsername: receiverUser.username,
                receiverProfilePicture: profilePicture,
                createdAt: rawChat.created_at,
                updatedAt: rawChat.updated_at,
            };

            chats.push(chat);
        }

        const sortedChats = ChatController.sortChatsByNewest(chats);
        return sortedChats;
    }

    static sortChatsByNewest(chats) {
        try {
            return chats.sort((a, b) => {
                return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                );
            });
        } catch (error) {
            console.error('ERROR:', error);
            return null;
        }
    }

    static sortMessagesByOldest(messages) {
        try {
            return messages.sort((a, b) => {
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
}
