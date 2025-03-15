// Third-Party Imports:
import path from 'path';

// Local Imports:
import audioChatMessagesModel from '../Models/AudioChatMessagesModel.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class MediaController {
    static async getAudioById(req, res) {
        const { id } = req.params;
        const userId = req.session.user.id;

        const result = await audioChatMessagesModel.getById({ id });
        if (!result)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (result.length === 0)
            return res.status(404).json({ msg: StatusMessage.AUDIO_NOT_FOUND });

        if (result.sender_id !== userId && result.receiver_id !== userId)
            return res
                .status(401)
                .json({ msg: StatusMessage.MEDIA_ACCESS_NOT_AUTHORIZED });

        const audio = result.audio_path;
        const audioPath = path.join(audio);
        res.sendFile(audioPath, (error) => {
            if (error) {
                res.status(404).json({ msg: StatusMessage.AUDIO_NOT_FOUND });
            }
        });
    }
}
