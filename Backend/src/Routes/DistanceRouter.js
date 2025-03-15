// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import DistanceController from '../Controllers/DistanceController.js';

export default class DistanceRouter {
    static createRouter() {
        const router = Router();

        // POST:
        router.post('/calculate', DistanceController.calculateDistance);

        return router;
    }
}
