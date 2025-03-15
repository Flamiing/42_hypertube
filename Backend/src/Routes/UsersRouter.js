// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import UsersController from '../Controllers/UsersController.js';
import BlockedUsersController from '../Controllers/BlockedUsersController.js';
import LocationController from '../Controllers/LocationController.js';
import { checkValidUserIdMiddleware } from '../Middlewares/checkValidUserIdMiddleware.js';
import { imageUploadMiddleware } from '../Middlewares/imageUploadMiddleware.js';
import { imagesValidationMiddleware } from '../Middlewares/imagesValidationMiddleware.js';
import { removeImageOnFailureMiddleware } from '../Middlewares/removeImageOnFailureMiddleware.js';
import ReportsController from '../Controllers/ReportsController.js';

export default class UsersRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', UsersController.getAllUsers);
        router.get('/me', UsersController.getMe);
        router.get('/blocked-users', BlockedUsersController.getAllBlockedUsers);
        router.get('/:username', UsersController.getUserProfile);
        router.get('/:id/profile-picture', UsersController.getProfilePicture);
        router.get('/:id/images', UsersController.getImages);
        router.get('/:id/images/:imageId', UsersController.getImageById);

        // POST:
        router.post(
            '/:id/images',
            checkValidUserIdMiddleware(),
            imageUploadMiddleware(),
            imagesValidationMiddleware(),
            UsersController.uploadImages,
            removeImageOnFailureMiddleware
        );
        router.post('/block/:id', BlockedUsersController.blockUser);
        router.post('/report/:id', ReportsController.reportUser);

        // DELETE:
        router.delete(
            '/:id/images/:imageId',
            checkValidUserIdMiddleware(),
            UsersController.deleteImage
        );
        router.delete('/block/:id', BlockedUsersController.unblockUser);

        // PATCH:
        router.patch(
            '/:id',
            checkValidUserIdMiddleware(),
            UsersController.updateUser
        );
        router.patch('/location/update', LocationController.updateUserLocation);

        // PUT:
        router.put(
            '/:id/profile-picture',
            checkValidUserIdMiddleware(),
            imageUploadMiddleware(),
            imagesValidationMiddleware(),
            UsersController.changeProfilePicture,
            removeImageOnFailureMiddleware
        );

        return router;
    }
}
