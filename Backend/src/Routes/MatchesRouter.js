// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import MatchesController from '../Controllers/MatchesController.js';

export default class MatchesRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', MatchesController.getAllUserMatches);

        return router;
    }
}
