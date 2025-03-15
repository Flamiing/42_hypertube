// Third-Party Imports:
import { Server } from 'socket.io';

// Local Imports:
import { socketSessionMiddleware } from '../Middlewares/socketSessionMiddleware.js';
import SocketController from './SocketController.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { authStatusSocketMiddleware } from '../Middlewares/authStatusSocketMiddleware.js';
import { handleError } from '../Utils/socketUtils.js';

class SocketHandler {
    constructor(server) {
        if (SocketHandler.instance) return SocketHandler.instance;

        this.io = new Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                credentials: true,
            },
        });
        this.PROTECTED_EVENTS = ['send-text-message', 'send-audio-message'];

        this.#setupConnectionMiddleware();
        this.#handleSocket();

        SocketHandler.instance = this;
    }

    static getInstance(server) {
        if (!SocketHandler.instance)
            SocketHandler.instance = new SocketHandler(server);

        return SocketHandler.instance;
    }

    getIo() {
        return this.io;
    }

    #setupConnectionMiddleware() {
        this.io.use(socketSessionMiddleware());
    }

    #setupSocketMiddleware(socket) {
        socket.use(authStatusSocketMiddleware(socket, this.PROTECTED_EVENTS));
    }

    #handleSocket() {
        this.io.on('connection', async (socket) => {
            console.info(`INFO: New socket connected: ${socket.id}`);

            if (socket.request.session.user) {
                const userStatusResult =
                    await SocketController.changeUserStatus(socket, 'online');
                if (!userStatusResult)
                    return handleError(
                        socket,
                        StatusMessage.ERROR_CHANGING_USER_STATUS
                    );
            }

            this.#setupSocketMiddleware(socket);

            socket.on(
                'send-text-message',
                async (data) =>
                    await SocketController.sendTextMessage(
                        this.io,
                        socket,
                        data
                    )
            );

            socket.on(
                'send-audio-message',
                async (data) =>
                    await SocketController.sendAudioMessage(
                        this.io,
                        socket,
                        data
                    )
            );

            socket.on('disconnect', async () => {
                if (socket.request.session.user) {
                    const userStatusResult =
                        await SocketController.changeUserStatus(
                            socket,
                            'offline'
                        );
                    if (!userStatusResult)
                        return handleError(
                            socket,
                            StatusMessage.ERROR_CHANGING_USER_STATUS
                        );
                }
                console.info(`INFO: Socket disconnected: ${socket.id}`);
            });
        });
    }
}

export default SocketHandler;
