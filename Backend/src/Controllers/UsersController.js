// Third-Party Imports:
import path from 'path';
import fsExtra from 'fs-extra';

// Local Imports:
import userModel from '../Models/UserModel.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import getPublicUser from '../Utils/getPublicUser.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorWithNext, returnErrorStatus } from '../Utils/errorUtils.js';

export default class UsersController {
    static async getAllUsers(req, res) {
        const users = await userModel.getAll();
        if (users) {
            const publicUsers = [];
            for (const user of users) {
                const publicUser = await getPublicUser(user);
                if (!publicUser)
                    return res
                        .status(500)
                        .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
                publicUsers.push(publicUser);
            }
            return res.json({ msg: publicUsers });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getMe(req, res) {
        const { id } = req.session.user;

        const user = await userModel.getById({ id });
        if (!user)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const me = await UsersController.getPrivateUser(res, user);
        if (!me) return res;

        return res.json({ msg: me });
    }

    static async getUserById(req, res) {
        const { id } = req.params;

        const user = await userModel.getById({ id });
        if (user) {
            if (user.length === 0)
                return res
                    .status(404)
                    .json({ msg: StatusMessage.NOT_FOUND_BY_ID });
            const publicUser = getPublicUser(user);
            if (!publicUser)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            return res.json({ msg: publicUser });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getUserProfile(req, res) {
        const { username } = req.params;

        const user = await userModel.getByReference(
            { username: username },
            true
        );
        if (user) {
            if (user.length === 0)
                return res
                    .status(404)
                    .json({ msg: StatusMessage.USER_NOT_FOUND });
            const publicUser = await getPublicUser(user);
            if (!publicUser)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

            return res.json({ msg: publicUser });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getProfilePicture(req, res) {
        const { id } = req.params;
        const user = await userModel.getById({ id });
        if (!user)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        let profilePicturePath = user.profile_picture;
        if (!profilePicturePath)
            profilePicturePath =
                '/backend/static/images/default-profile-picture.png';
        const imagePath = path.join(profilePicturePath);
        res.sendFile(imagePath, (error) => {
            if (error) {
                console.error('ERROR:', error);
                res.status(404).json({ msg: StatusMessage.IMAGE_NOT_FOUND });
            }
        });
    }

    static async updateUser(req, res) {
        const isValidData = await UsersController.validateData(req, res);
        if (!isValidData) return res;

        const { id } = req.params;
        const { input, inputHasNoContent } = isValidData;

        let user = null;
        if (!inputHasNoContent) {
            user = await userModel.update({ input, id });
        } else {
            user = await userModel.getById({ id });
        }
        if (!user)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const privateUser = await UsersController.getPrivateUser(res, user);
        if (!privateUser) return res;
        return res.json({ msg: privateUser });
    }

    static async validateData(req, res) {
        const validatedUser = await validatePartialUser(req.body);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return returnErrorStatus(res, 400, errorMessage);
        }

        const input = validatedUser.data;
        const inputHasNoContent = Object.keys(input).length === 0;
        if (inputHasNoContent)
            return returnErrorStatus(
                res,
                400,
                StatusMessage.NO_PROFILE_INFO_TO_EDIT
            );

        if (input.username)
            return returnErrorStatus(
                res,
                403,
                StatusMessage.CANNOT_CHANGE_USERNAME
            );
        if (input.email && req.session.user.oauth)
            return returnErrorStatus(
                res,
                403,
                StatusMessage.CANNOT_CHANGE_EMAIL
            );

        const { email, username } = input;
        const isUnique = await userModel.isUnique({ email, username });
        if (!isUnique) {
            if (email)
                return returnErrorStatus(
                    res,
                    400,
                    StatusMessage.DUPLICATE_EMAIL
                );
            return returnErrorStatus(
                res,
                400,
                StatusMessage.DUPLICATE_USERNAME
            );
        }
        return { input, inputHasNoContent };
    }

    static async changeProfilePicture(req, res, next) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        try {
            const { id } = req.params;

            if (req.files.length !== 1)
                return returnErrorWithNext(
                    res,
                    next,
                    400,
                    StatusMessage.BAD_REQUEST
                );

            const deleteResult =
                await UsersController.deletePreviousProfilePicture(res, id);
            if (!deleteResult)
                return returnErrorWithNext(
                    res,
                    next,
                    res.statusCode,
                    res.responseData.body
                );

            const input = { profile_picture: req.files[0].path };
            const updateResult = await userModel.update({ input, id });
            if (!updateResult)
                return returnErrorWithNext(
                    res,
                    next,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );
            if (updateResult.length === 0)
                return returnErrorWithNext(
                    res,
                    next,
                    404,
                    StatusMessage.USER_NOT_FOUND
                );
            return res.json({
                msg: `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${id}/profile-picture`,
            });
        } catch (error) {
            console.error('Error uploading file: ', error);
            return returnErrorWithNext(
                res,
                next,
                400,
                StatusMessage.ERROR_UPLOADING_IMAGE
            );
        }
    }

    static async deletePreviousProfilePicture(res, id) {
        const user = await userModel.getById({ id });
        if (!user)
            return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);
        if (user.length === 0)
            return returnErrorStatus(res, 404, StatusMessage.USER_NOT_FOUND);
        if (!user.profile_picture) return true;

        try {
            await fsExtra.remove(user.profile_picture);
            return true;
        } catch (error) {
            console.error('Error deleting file: ', error);
            return false;
        }
    }

    static async getPrivateUser(res, user) {
        const privateUser = await getPublicUser(user);
        if (!privateUser)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        privateUser.email = user.email;

        return privateUser;
    }
}
