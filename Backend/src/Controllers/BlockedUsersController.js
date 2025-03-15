// Local Imports:
import blockedUsersModel from '../Models/BlockedUsersModel.js';
import likesModel from '../Models/LikesModel.js';
import matchesModel from '../Models/MatchesModel.js';
import userModel from '../Models/UserModel.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { validateUserId } from '../Validations/blockedUsersValidations.js';

export default class BlockedUsersController {
    static async getAllBlockedUsers(req, res) {
        let reference = {
            blocked_by: req.session.user.id,
        };

        const rawBlockedUsers = await blockedUsersModel.getByReference(
            reference,
            false
        );
        if (!rawBlockedUsers)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        const blockedUsers = await BlockedUsersController.getBlockedUsersInfo(
            req,
            res,
            rawBlockedUsers
        );
        if (!blockedUsers) return res;

        return res.json({ msg: blockedUsers });
    }

    static async blockUser(req, res) {
        const blockedById = req.session.user.id;
        const blockedId = req.params.id;
        const validUserId = await validateUserId(blockedId);
        if (!validUserId)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        // add user to blocked
        const userAlreadyBlocked =
            await BlockedUsersController.userAlreadyBlocked(
                res,
                blockedById,
                blockedId
            );
        if (userAlreadyBlocked === null) return res;
        if (userAlreadyBlocked)
            return res.json({ msg: StatusMessage.USER_ALREADY_BLOCKED });

        const input = {
            blocked_by: blockedById,
            blocked: blockedId,
        };
        const blockedUser = await blockedUsersModel.create({ input });
        if (!blockedUser || blockedUser.length === 0)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        // delete user match if exists
        const deleteMatch = await matchesModel.deleteMatch(
            res,
            blockedById,
            blockedId
        );
        if (!deleteMatch) return res;

        // delete user like if exists
        const deleteLike = await BlockedUsersController.deleteLike(
            res,
            blockedById,
            blockedId
        );
        if (!deleteLike) return res;

        return res.json({ msg: StatusMessage.USER_BLOCKED });
    }

    static async unblockUser(req, res) {
        const blockedById = req.session.user.id;
        const blockedId = req.params.id;
        const validUserId = await validateUserId(blockedId);
        if (!validUserId)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const reference = {
            blocked_by: blockedById,
            blocked: blockedId,
        };
        const unblockUser =
            await blockedUsersModel.deleteByReference(reference);
        if (unblockUser === null)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (!unblockUser)
            return res
                .status(400)
                .json({ msg: StatusMessage.USER_NOT_BLOCKED });

        return res.json({ msg: StatusMessage.USER_UNBLOCKED });
    }

    static async userAlreadyBlocked(res, blockedById, blockedId) {
        const reference = {
            blocked_by: blockedById,
            blocked: blockedId,
        };

        const blockedUser = await blockedUsersModel.getByReference(
            reference,
            false
        );
        if (!blockedUser) {
            res.status(500).json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            return null;
        }
        if (blockedUser.length === 0) return false;

        return true;
    }

    static async deleteLike(res, blockedById, blockedId) {
        const reference = {
            liked_by: blockedById,
            liked: blockedId,
        };
        const removeLike = await likesModel.deleteByReference(reference);
        if (removeLike === null)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        return true;
    }

    static async getBlockedUsersInfo(req, res, rawBlockedUsers) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        let blockeUsers = [];

        for (const blockedUser of rawBlockedUsers) {
            const id = blockedUser.blocked;
            const user = await userModel.getById({ id });
            if (!user || user.length === 0)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );

            const profilePictureURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${id}/profile-picture`;

            const newBlockedUser = {
                userId: id,
                username: user.username,
                profilePicture: profilePictureURL,
            };
            blockeUsers.push(newBlockedUser);
        }

        return blockeUsers;
    }
}
