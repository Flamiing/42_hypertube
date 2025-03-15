// Local Imports:
import Model from '../Core/Model.js';

class ViewsHistoryModel extends Model {
    constructor() {
        super('views_history');
    }

    async getUserViewsHistory(viewedUserId) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        const query = {
            text: `SELECT 
                u.username,
                u.id,
                v.time
            FROM 
                views_history v
            JOIN 
                users u
            ON 
                v.viewed_by = u.id
            WHERE 
                v.viewed = $1
            ORDER BY time DESC;`,
            values: [viewedUserId],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];
            let views = [];
            for (const view of result.rows) {
                const profilePictureURL = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${view.id}/profile-picture`;
                view.profilePicture = profilePictureURL;
                delete view.id;
                views.push(view);
            }
            return views;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }
}

const viewsHistoryModel = new ViewsHistoryModel();
export default viewsHistoryModel;
