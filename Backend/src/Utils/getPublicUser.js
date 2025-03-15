// Local Imports:
import userTagsModel from '../Models/UserTagsModel.js';
import imagesModel from '../Models/ImagesModel.js';
import { parseImages } from './imagesUtils.js';
import geolocationModel from '../Models/UserLocationModel.js';
import userStatusModel from '../Models/UserStatusModel.js';

export default async function getPublicUser(user) {
    const { API_HOST, API_PORT, API_VERSION } = process.env;

    const userTags = await userTagsModel.getUserTags(user.id);
    if (!userTags) return null;
    const profilePicture = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${user.id}/profile-picture`;

    const reference = { user_id: user.id };
    const imagesToParse = await imagesModel.getByReference(reference, false);
    if (!imagesToParse) return null;

    const { id } = user;
    const userLocation = await geolocationModel.getById({ id });
    if (!userLocation) return null;
    delete userLocation.id;
    userLocation.latitude = parseFloat(userLocation.latitude);
    userLocation.longitude = parseFloat(userLocation.longitude);

    const images =
        imagesToParse.length !== 0 ? parseImages(user.id, imagesToParse) : [];

    const userStatus = await userStatusModel.getByReference(
        { user_id: id },
        true
    );
    if (!userStatus) return null;

    const publicUser = {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        age: parseInt(user.age),
        biography: user.biography,
        profile_picture: profilePicture,
        location: userLocation.length === 0 ? {} : userLocation,
        fame: parseInt(user.fame),
        is_online: userStatus.status === 'online' ? true : false,
        last_online: userStatus.last_online,
        gender: user.gender,
        sexual_preference: user.sexual_preference,
        tags: userTags,
        images: images,
    };

    if (user.common_tags_count)
        publicUser.common_tags_count = parseInt(user.common_tags_count);

    return publicUser;
}
