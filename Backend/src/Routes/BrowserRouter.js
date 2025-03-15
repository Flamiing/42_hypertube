// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import BrowserController from '../Controllers/BrowserController.js';

export default class BrowserRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', BrowserController.browser);

        return router;
    }
}
