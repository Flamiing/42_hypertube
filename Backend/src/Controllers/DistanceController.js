// Local Imports:
import { validateLocations } from '../Schemas/locationsSchema.js';
import { getDistance } from '../Utils/locationUtils.js';

export default class DistanceController {
    static async calculateDistance(req, res) {
        const locations = validateLocations(req.body);
        if (!locations.success) {
            const errorMessage = locations.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        const distance = getDistance(
            locations.data.locationOne,
            locations.data.locationTwo
        );
        return res.json({ msg: parseFloat(distance.toFixed(2)) });
    }
}
