// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import LibraryController from '../Controllers/LibraryController.js';

export default class MoviesRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/library/:page?', LibraryController.library);

        return router;
    }
}
