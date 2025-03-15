// Local Imports:
import Model from '../Core/Model.js';

class NotificationsModel extends Model {
    constructor() {
        super('notifications');
    }

    async updateReadStatus(userId, readStatus) {
        const oldReadStatus = readStatus ? false : true;
        const values = [readStatus, oldReadStatus, userId];

        const query = {
            text: `UPDATE ${this.table} SET read = $1 WHERE read = $2 AND user_id = $3 RETURNING *;`,
            values: values,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return true;
            return true;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return false;
        }
    }
}

const notificationsModel = new NotificationsModel();
export default notificationsModel;
