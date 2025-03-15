// Local Imports:
import Model from '../Core/Model.js';

class ReportsModel extends Model {
    constructor() {
        super('reports');
    }

    async isUserReported(reportedById, blockedId) {
        const reference = {
            reported_by: reportedById,
            reported: blockedId,
        };

        const reportedUser = await this.getByReference(reference, false);
        if (reportedUser === null) return null;
        if (reportedUser.length === 0) return false;

        return true;
    }
}

const reportsModel = new ReportsModel();
export default reportsModel;
