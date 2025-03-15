// Local Imports:
import Model from '../Core/Model.js';
import { deleteAudioFile } from '../Utils/chatUtils.js';

class AudioChatMessagesModel extends Model {
    constructor() {
        super('audio_chat_messages');
    }

    async deleteMessages(userIdOne, userIdTwo) {
        let reference = {
            sender_id: userIdOne,
            receiver_id: userIdTwo,
        };
        let messages = await this.getByReference(reference, false);
        if (!messages) return null;
        let removeMessage = await this.deleteByReference(reference);
        if (removeMessage === null) return false;
        if (!removeMessage) {
            reference = {
                sender_id: userIdTwo,
                receiver_id: userIdOne,
            };

            messages = await this.getByReference(reference, false);
            if (!messages) return null;
            removeMessage = await this.deleteByReference(reference);
            if (removeMessage.length === 0) return false;
        }

        for (const message of messages) {
            if (!(await deleteAudioFile(message.audio_path))) return false;
        }

        return true;
    }
}

const audioChatMessagesModel = new AudioChatMessagesModel();
export default audioChatMessagesModel;
