// Local Imports:
import matchesModel from '../Models/MatchesModel.js';
import userModel from '../Models/UserModel.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';

export async function validateMatch(
    res,
    matchId,
    attendeeOneId,
    attendeeTwoId
) {
    const id = matchId;
    const match = await matchesModel.getById({ id });
    if (!match)
        return returnErrorStatus(res, 500, StatusMessage.INTERNAL_SERVER_ERROR);
    if (match.length === 0)
        return returnErrorStatus(res, 400, StatusMessage.BAD_REQUEST);

    if (match.user_id_1 !== attendeeOneId && match.user_id_2 !== attendeeTwoId)
        if (
            match.user_id_1 !== attendeeTwoId &&
            match.user_id_2 !== attendeeOneId
        )
            return returnErrorStatus(
                res,
                403,
                StatusMessage.MATCH_DOES_NOT_EXIST
            );

    return true;
}

export async function validateInvitedUserId(res, id) {
    const user = await userModel.getById({ id });
    if (!user)
        return returnErrorStatus(res, 500, StatusMessage.INTERNAL_SERVER_ERROR);
    if (user.length === 0)
        return returnErrorStatus(res, 404, StatusMessage.USER_NOT_FOUND);

    return true;
}
