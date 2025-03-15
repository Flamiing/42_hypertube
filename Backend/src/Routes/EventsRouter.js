// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import EventsController from '../Controllers/EventsController.js';

export default class EventsRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', EventsController.getAllUserEvents);

        // POST:
        router.post('/', EventsController.createEvent);

        // DELETE:
        router.delete('/:id', EventsController.deleteEvent);

        return router;
    }
}
