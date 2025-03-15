// Local Imports:
import userModel from '../Models/UserModel.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import getPublicUser from '../Utils/getPublicUser.js';
import { getDistance } from '../Utils/locationUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class BrowserController {
    static async browser(req, res) {
        const { id } = req.session.user;

        const user = await userModel.getById({ id });
        if (!user)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const publicUser = await getPublicUser(user);

        const rawUsers = await userModel.getUsersForBrowser(publicUser);
        if (!rawUsers)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (rawUsers.length === 0) return res.json({ msg: [] });

        const users = await BrowserController.filterUsers(
            res,
            publicUser.location,
            rawUsers
        );
        if (!users) return res;

        return res.json({ msg: users });
    }

    static async getPublicProfiles(res, users) {
        let publicProfiles = [];

        for (const user of users) {
            const publicProfile = await getPublicUser(user);
            if (!publicProfile)
                return returnErrorStatus(
                    res,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );
            publicProfiles.push(publicProfile);
        }

        return publicProfiles;
    }

    static async filterUsers(res, userLocation, rawUsers) {
        let users = await BrowserController.getPublicProfiles(res, rawUsers);
        if (!users) return res;

        users = BrowserController.filterByGeographicArea(users, userLocation);
        BrowserController.sortUsersByDistance(users, userLocation);
        BrowserController.sortByMaxCommonTags(users);
        BrowserController.sortByMaxFame(users);
        return users;
    }

    static filterByGeographicArea(users, location) {
        let filteredUsers = [];

        for (const user of users) {
            const distance = getDistance(user.location, location);
            if (distance < 160) filteredUsers.push(user);
        }

        return filteredUsers;
    }

    static sortUsersByDistance(users, location) {
        try {
            return users.sort((a, b) => {
                const distanceA = getDistance(a.location, location);
                const distanceB = getDistance(b.location, location);
                return distanceA - distanceB; // Ascending order (closest first)
            });
        } catch {
            return [];
        }
    }

    static sortByMaxCommonTags(users) {
        try {
            return users.sort((a, b) => {
                return b.common_tags_count - a.common_tags_count; // Ascending order
            });
        } catch {
            return [];
        }
    }

    static sortByMaxFame(users) {
        return users.sort((a, b) => {
            return b.fame - a.fame; // Ascending order
        });
    }
}
