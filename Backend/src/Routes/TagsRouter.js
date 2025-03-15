// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import TagsController from '../Controllers/TagsController.js';

export default class TagsRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', TagsController.getAllTags);

        return router;
    }
}
