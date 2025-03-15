// Local Imports:
import Model from '../Core/Model.js';

class ChatsModel extends Model {
    constructor() {
        super('chats');
    }

    async deleteChat(res, userIdOne, userIdTwo) {
        let reference = {
            user_id_1: userIdOne,
            user_id_2: userIdTwo,
        };
        let removeChat = await this.deleteByReference(reference);
        if (removeChat === null)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        if (!removeChat) {
            reference = {
                user_id_1: userIdTwo,
                user_id_2: userIdOne,
            };

            removeChat = await this.deleteByReference(reference);
            if (removeChat.length === 0)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );
        }

        return true;
    }
}

const chatsModel = new ChatsModel();
export default chatsModel;
