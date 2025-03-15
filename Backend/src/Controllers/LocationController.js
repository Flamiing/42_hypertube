// Local Imports:
import userLocationModel from '../Models/UserLocationModel.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class LocationController {
    static async updateUserLocation(req, res) {
        const { id } = req.session.user;
        const { location } = req.body;

        if (!location)
            return res.status(400).json({ msg: StatusMessage.NO_LOCATION });

        const userLocationUpdate = await userLocationModel.update(location, id);
        if (!userLocationUpdate)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (userLocationUpdate.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        return res.json({ msg: location });
    }
}
