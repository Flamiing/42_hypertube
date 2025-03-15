// Local Imports:
import Model from '../Core/Model.js';

class TextChatMessagesModel extends Model {
    constructor() {
        super('text_chat_messages');
    }
}

const textChatMessagesModel = new TextChatMessagesModel();
export default textChatMessagesModel;
