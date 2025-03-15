// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import NotificationsController from '../Controllers/NotificationsController.js';

export default class NotificationsRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', NotificationsController.getAllNotifications);

        // PATCH:
        router.patch('/mark-read', NotificationsController.markRead);

        return router;
    }
}
