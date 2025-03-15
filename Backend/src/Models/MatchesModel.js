// Local Imports:
import Model from '../Core/Model.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';
import audioChatMessagesModel from './AudioChatMessagesModel.js';

class MatchesModel extends Model {
    constructor() {
        super('matches');
    }

    async findMatchId(userIdOne, userIdTwo) {
        let reference = {
            user_id_1: userIdOne,
            user_id_2: userIdTwo,
        };

        let match = await this.getByReference(reference, false);
        if (!match) return null;
        if (match.length === 0) {
            reference = {
                user_id_1: userIdTwo,
                user_id_2: userIdOne,
            };

            match = await this.getByReference(reference, false);
            if (!match) return null;
        }

        return match.id;
    }

    async deleteMatch(res, userIdOne, userIdTwo) {
        let reference = {
            user_id_1: userIdOne,
            user_id_2: userIdTwo,
        };
        let removeMatch = await this.deleteByReference(reference);
        if (removeMatch === null)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        if (!removeMatch) {
            reference = {
                user_id_1: userIdTwo,
                user_id_2: userIdOne,
            };

            removeMatch = await this.deleteByReference(reference);
            if (removeMatch.length === 0)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );
        }

        if (
            !(await audioChatMessagesModel.deleteMessages(userIdOne, userIdTwo))
        )
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        return true;
    }
}

const matchesModel = new MatchesModel();
export default matchesModel;
