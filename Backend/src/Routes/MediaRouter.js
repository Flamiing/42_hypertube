// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import MediaController from '../Controllers/MediaController.js';

export default class MediaRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/audio/:id', MediaController.getAudioById);

        return router;
    }
}
