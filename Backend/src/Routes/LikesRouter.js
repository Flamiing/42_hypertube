// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import LikesController from '../Controllers/LikesController.js';

export default class LikesRouter {
    static createRouter() {
        const router = Router();

        // PUT:
        router.put('/:likedId', LikesController.handleLike);

        return router;
    }
}
