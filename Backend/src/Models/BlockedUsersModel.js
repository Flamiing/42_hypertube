// Local Imports:
import Model from '../Core/Model.js';

class BlockedUsersModel extends Model {
    constructor() {
        super('blocked_users');
    }

    async isUserBlocked(blockedById, blockedId) {
        const reference = {
            blocked_by: blockedById,
            blocked: blockedId,
        };

        const blockedUser = await this.getByReference(reference, false);
        if (blockedUser === null) return null;
        if (blockedUser.length === 0) return false;

        return true;
    }
}

const blockedUsersModel = new BlockedUsersModel();
export default blockedUsersModel;
