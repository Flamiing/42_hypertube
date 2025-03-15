// Third-Party Imports:
import path from 'path';
import fsExtra from 'fs-extra';

// Local Imports:
import userModel from '../Models/UserModel.js';
import likesModel from '../Models/LikesModel.js';
import userTagsModel from '../Models/UserTagsModel.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import getPublicUser from '../Utils/getPublicUser.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorWithNext, returnErrorStatus } from '../Utils/errorUtils.js';
import imagesModel from '../Models/ImagesModel.js';
import viewsHistoryModel from '../Models/ViewsHistoryModel.js';
import { getTimestampWithTZ } from '../Utils/timeUtils.js';
import { parseImages } from '../Utils/imagesUtils.js';
import { getUserLikesAndBlocks } from '../Utils/userUtils.js';
import Notifications from '../Sockets/Notifications.js';

export default class UsersController {
    static MAX_NUM_USER_IMAGES = 4;

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

            if (user.id !== req.session.user.id) {
                const viewResult = await UsersController.saveView(
                    res,
                    user.id,
                    req.session.user.id
                );
                if (!viewResult) return res;

                const updateFameResult = await userModel.updateFame(
                    user.id,
                    publicUser
                );
                if (!updateFameResult)
                    return res
                        .status(500)
                        .json({ msg: StatusMessage.QUERY_ERROR });
            }

            if (
                !(await getUserLikesAndBlocks(
                    res,
                    req.session.user.id,
                    publicUser
                ))
            )
                return res;

            return res.json({ msg: publicUser });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getImages(req, res) {
        const { id } = req.params;

        const reference = { user_id: id };
        const imagesToParse = await imagesModel.getByReference(
            reference,
            false
        );
        if (!imagesToParse)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (imagesToParse.length === 0)
            return res.status(404).json({ msg: StatusMessage.NO_IMAGES_FOUND });

        const images = parseImages(id, imagesToParse);

        return res.json({ msg: images });
    }

    static async getImageById(req, res) {
        const { imageId } = req.params;

        const id = imageId;

        const result = await imagesModel.getById({ id });
        if (!result)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (result.length === 0)
            return res.status(404).json({ msg: StatusMessage.IMAGE_NOT_FOUND });

        const image = result.image_path;
        const imagePath = path.join(image);
        res.sendFile(imagePath, (error) => {
            if (error) {
                res.status(404).json({ msg: StatusMessage.IMAGE_NOT_FOUND });
            }
        });
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

        const tagsUpdateResult = await UsersController.updateTags(req, res);
        if (!tagsUpdateResult) return res;

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

    static async updateTags(req, res) {
        const { id } = req.params;
        const { tags } = req.body;

        const tagsUpdateResult = await userTagsModel.updateUserTags(id, tags);
        if (!tagsUpdateResult)
            return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);
        if (tagsUpdateResult.length === 0)
            return returnErrorStatus(res, 400, StatusMessage.INVALID_USER_TAG);

        return true;
    }

    static async validateData(req, res) {
        const validatedUser = await validatePartialUser(req.body);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return returnErrorStatus(res, 400, errorMessage);
        }

        const { tags } = req.body;
        const input = validatedUser.data;
        const inputHasNoContent = Object.keys(input).length === 0;
        if (inputHasNoContent && !tags)
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

    static async uploadImages(req, res, next) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        const { id } = req.params;

        // Check if the user has space for the images
        const exceedsImageLimit = await UsersController.exceedsImageLimit(
            res,
            id,
            req.files.length
        );
        if (exceedsImageLimit)
            return returnErrorWithNext(
                res,
                next,
                res.statusCode,
                res.responseData.body
            );

        let images = [];
        for (const image of req.files) {
            const imageId = path.parse(image.filename).name;
            const imageURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${id}/images/${imageId}`;
            const imageInfo = {
                imageId: imageId,
                imageURL: imageURL,
            };
            images.push(imageInfo);
            const result = await UsersController.saveImageToDB(
                res,
                id,
                imageId,
                image.path
            );
            if (!result)
                return returnErrorWithNext(
                    res,
                    next,
                    res.statusCode,
                    res.responseData.body
                );
        }

        return res.json({ msg: images });
    }

    static async exceedsImageLimit(res, userId, numImagesUploaded) {
        if (numImagesUploaded > UsersController.MAX_NUM_USER_IMAGES) {
            res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
            return true;
        }

        const numImagesDB = await imagesModel.countRecordsByReference({
            user_id: userId,
        });
        if (numImagesDB === null) {
            res.status(400).json({ msg: StatusMessage.QUERY_ERROR });
            return true;
        }

        if (numImagesDB === UsersController.MAX_NUM_USER_IMAGES) {
            res.status(400).json({ msg: StatusMessage.EXCEEDS_IMAGE_LIMIT_DB });
            return true;
        }

        if (
            numImagesDB + numImagesUploaded >
            UsersController.MAX_NUM_USER_IMAGES
        ) {
            res.status(400).json({ msg: StatusMessage.EXCEEDS_IMAGE_LIMIT });
            return true;
        }

        return false;
    }

    static async saveImageToDB(res, userId, imageId, imagePath) {
        const input = {
            id: imageId,
            user_id: userId,
            image_path: imagePath,
        };

        const result = await imagesModel.create({ input });
        if (!result || result.length === 0)
            return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);

        return true;
    }

    static async deleteImage(req, res) {
        const { imageId } = req.params;

        const id = imageId;

        const image = await imagesModel.getById({ id });
        if (!image)
            return res
                .json(500)
                .json({ msg: StatusMessage.ERROR_DELETING_IMAGE });
        if (image.length === 0)
            return res.status(404).json({ msg: StatusMessage.IMAGE_NOT_FOUND });

        const deleteResult = await imagesModel.delete({ id });
        if (!deleteResult)
            return res
                .status(400)
                .json({ msg: StatusMessage.ERROR_DELETING_IMAGE });

        try {
            await fsExtra.remove(image.image_path);
            console.info(
                `Image with path '${image.image_path}' has been removed successfully!`
            );
            return res.json({ msg: StatusMessage.IMAGE_DELETED_SUCCESSFULLY });
        } catch (error) {
            console.error(`Error deleting file ${image.image_path}: ${error}`);
            return res
                .json(500)
                .json({ msg: StatusMessage.ERROR_DELETING_IMAGE });
        }
    }

    static async saveView(res, viewedId, viewedById) {
        const reference = {
            viewed_by: viewedById,
            viewed: viewedId,
        };
        const view = await viewsHistoryModel.getByReference(reference, true);
        if (!view)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        let input = {
            viewed_by: viewedById,
            viewed: viewedId,
            time: getTimestampWithTZ(),
        };

        if (view && view.length !== 0) {
            const { id } = view;
            const updateResult = await viewsHistoryModel.update({ input, id });
            if (!updateResult || updateResult.length === 0)
                return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);
            await Notifications.sendNotification('view', viewedId, viewedById);
            return true;
        }

        const viewUpdateResult = await viewsHistoryModel.create({ input });
        if (!viewUpdateResult || viewUpdateResult.length === 0)
            return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);

        await Notifications.sendNotification('view', viewedId, viewedById);
        return true;
    }

    static async getPrivateUser(res, user) {
        const privateUser = await getPublicUser(user);
        if (!privateUser)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        const likes = await likesModel.getUserLikes(user.id);
        if (!likes)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        const views = await viewsHistoryModel.getUserViewsHistory(user.id);
        if (!views)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        privateUser.likes = likes;
        privateUser.views = views;
        privateUser.email = user.email;

        return privateUser;
    }
}
