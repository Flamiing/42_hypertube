// Local Imports:
import Model from '../Core/Model.js';

class UserStatusModel extends Model {
    constructor() {
        super('user_status');
    }
}

const userStatusModel = new UserStatusModel();
export default userStatusModel;
