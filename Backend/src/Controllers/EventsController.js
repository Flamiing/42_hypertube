// Local Imports:
import eventsModel from '../Models/EventsModel.js';
import userModel from '../Models/UserModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { validateEvent } from '../Schemas/eventSchema.js';
import {
    validateMatch,
    validateInvitedUserId,
} from '../Validations/eventsValidations.js';
import { validEventDate } from '../Utils/timeUtils.js';
import { isValidUUID } from '../Validations/generalValidations.js';

export default class EventsController {
    static async getAllUserEvents(req, res) {
        let reference = {
            attendee_id_1: req.session.user.id,
        };

        const eventsOne = await eventsModel.getByReference(reference, false);
        if (!eventsOne)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        reference = {
            attendee_id_2: req.session.user.id,
        };

        const eventsTwo = await eventsModel.getByReference(reference, false);
        if (!eventsTwo)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        const rawEvents = [...eventsOne, ...eventsTwo];

        const events = await EventsController.getEventsInfo(
            req,
            res,
            rawEvents
        );
        if (!events) return res;

        return res.json({ msg: events });
    }

    static async getEventsInfo(req, res, rawEvents) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        let events = [];

        for (const event of rawEvents) {
            let id = event.attendee_id_1;
            const attendeeOne = await userModel.getById({ id });
            if (!attendeeOne || attendeeOne.length === 0)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );

            id = event.attendee_id_2;
            const attendeeTwo = await userModel.getById({ id });
            if (!attendeeTwo || attendeeTwo.length === 0)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );

            const profilePictureOneURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${attendeeOne.id}/profile-picture`;
            const profilePictureTwoURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${attendeeTwo.id}/profile-picture`;

            const newEvent = {
                eventId: event.id,
                attendeeOneInfo: {
                    userId: attendeeOne.id,
                    username: attendeeOne.username,
                    profilePicture: profilePictureOneURL,
                },
                attendeeTwoInfo: {
                    userId: attendeeTwo.id,
                    username: attendeeTwo.username,
                    profilePicture: profilePictureTwoURL,
                },
                title: event.title,
                description: event.description,
                date: event.date,
            };
            events.push(newEvent);
        }

        return events;
    }

    static async createEvent(req, res) {
        const validatedEvent = validateEvent(req.body);
        if (!validatedEvent.success) {
            const errorMessage = validatedEvent.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        if (!validEventDate(validatedEvent.data.date))
            return res
                .status(400)
                .json({ msg: StatusMessage.INVALID_EVENT_DATE });

        const validMatchId = await validateMatch(
            res,
            validatedEvent.data.matchId,
            req.session.user.id,
            validatedEvent.data.invitedUserId
        );
        if (!validMatchId) return res;

        const validInvitedUserId = await validateInvitedUserId(
            res,
            validatedEvent.data.invitedUserId
        );
        if (!validInvitedUserId) return res;

        const input = {
            attendee_id_1: req.session.user.id,
            attendee_id_2: validatedEvent.data.invitedUserId,
            match_id: validatedEvent.data.matchId,
            title: validatedEvent.data.title,
            description: validatedEvent.data.description,
            date: validatedEvent.data.date,
        };

        const event = await eventsModel.create({ input });
        if (!event)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (event.length === 0)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });

        return res.json({ msg: event });
    }

    static async deleteEvent(req, res) {
        if (!isValidUUID(req.params.id))
            return res.status(400).json({ msg: StatusMessage.EVENT_NOT_FOUND });

        const reference = {
            id: req.params.id,
            attendee_id_1: req.session.user.id,
        };

        let deleteResult = await eventsModel.deleteByReference(reference);
        if (deleteResult === null)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (!deleteResult) {
            delete reference.attendee_id_1;
            reference.attendee_id_2 = req.session.user.id;
            deleteResult = await eventsModel.deleteByReference(reference);
            if (deleteResult === null)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            if (!deleteResult)
                return res
                    .status(404)
                    .json({ msg: StatusMessage.EVENT_NOT_FOUND });
        }

        return res.json({ msg: StatusMessage.EVENT_DELETION_SUCCESSFUL });
    }
}
