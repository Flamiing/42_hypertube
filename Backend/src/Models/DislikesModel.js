// Local Imports:
import Model from '../Core/Model.js';

class DislikesModel extends Model {
    constructor() {
        super('dislikes');
    }

    async isUserDisliked(dislikedById, dislikedId) {
        const reference = {
            disliked_by: dislikedById,
            disliked: dislikedId,
        };

        const dislikedUser = await this.getByReference(reference, false);
        if (dislikedUser === null) return null;
        if (dislikedUser.length === 0) return false;

        return true;
    }
}

const dislikesModel = new DislikesModel();
export default dislikesModel;
