// Third-Party Imports:
import { randomUUID } from 'crypto';
import fsExtra from 'fs-extra';
import path from 'path';

// Local Imports:
import StatusMessage from './StatusMessage.js';
import { emitErrorAndReturnNull } from './errorUtils.js';
import audioChatMessagesModel from '../Models/AudioChatMessagesModel.js';
import { getTimestampWithTZ } from './timeUtils.js';
import chatsModel from '../Models/ChatsModel.js';

export async function processAudioMessage(socket, senderId, payload) {
    const { API_HOST, API_PORT, API_VERSION } = process.env;

    const audioPath = saveAudioToFileSystem(senderId, payload.message);
    if (!audioPath)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.FAILED_SENDING_CHAT_MESSAGE
        );

    const audioId = audioPath
        .split('/')
        .pop()
        .replace(/\.mp3$/i, '');
    const chatMessage = {
        id: audioId,
        chat_id: payload.chatId,
        sender_id: senderId,
        receiver_id: payload.receiverId,
        audio_path: audioPath,
        created_at: payload.createdAt,
    };

    const savedChatMessage = await audioChatMessagesModel.create({
        input: chatMessage,
    });
    if (!savedChatMessage || savedChatMessage.length === 0)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.FAILED_SENDING_CHAT_MESSAGE
        );

    const chatUpdateResult = await changeChatUpdatedAtTimestamp(payload.chatId);
    if (!chatUpdateResult)
        return emitErrorAndReturnNull(
            socket,
            StatusMessage.FAILED_SENDING_CHAT_MESSAGE
        );

    const audioURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/media/audio/${savedChatMessage.id}`;

    return audioURL;
}

export async function changeChatUpdatedAtTimestamp(chatId) {
    const input = {
        updated_at: getTimestampWithTZ(),
    };
    const updatedChat = await chatsModel.update({ input, id: chatId });
    if (!updatedChat || updatedChat.length === 0) return null;

    return updatedChat;
}

function saveAudioToFileSystem(userId, base64String) {
    const { USER_UPLOADS_PATH } = process.env;

    const audioBuffer = Buffer.from(base64String, 'base64');
    const audioName = randomUUID() + '.mp3';
    const folderPath = path.join(USER_UPLOADS_PATH, userId, 'audios');
    const filePath = path.join(USER_UPLOADS_PATH, userId, 'audios', audioName);
    fsExtra.ensureDirSync(folderPath);

    fsExtra.writeFile(filePath, audioBuffer, (error) => {
        if (error) {
            console.error('Error saving MP3 file:', error);
            return null;
        }
        console.info('INFO: MP3 file saved successfully! -', filePath);
    });

    return filePath;
}

export async function deleteAudioFile(path) {
    try {
        await fsExtra.remove(path);
        console.info(
            `Audio file with path '${path}' has been removed successfully!`
        );
        return true;
    } catch (error) {
        console.error(`Error deleting file ${path}: ${error}`);
        return false;
    }
}
