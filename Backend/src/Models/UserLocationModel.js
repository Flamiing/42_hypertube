// Local Imports:
import Model from '../Core/Model.js';

class UserLocationModel extends Model {
    constructor() {
        super('user_location');
    }

    async update(location, id) {
        const values = [
            id,
            location.latitude,
            location.longitude,
            location.allows_location,
        ];

        const query = {
            text: `INSERT INTO ${this.table} (id, latitude, longitude, allows_location)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE
            SET latitude = $2, longitude = $3, allows_location = $4
            RETURNING *;`,
            values: values,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return {};
            return result.rows[0];
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }
}

const userLocationModel = new UserLocationModel();
export default userLocationModel;
