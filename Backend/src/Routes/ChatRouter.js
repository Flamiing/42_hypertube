// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import ChatController from '../Controllers/ChatController.js';

export default class ChatRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', ChatController.getAllChats);
        router.get('/:id', ChatController.getChatById);

        return router;
    }
}
