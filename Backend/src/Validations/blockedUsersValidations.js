// Local Imports:
import userModel from '../Models/UserModel.js';
import { isValidUUID } from '../Validations/generalValidations.js';

export async function validateUserId(id) {
    if (!isValidUUID(id)) return false;

    const user = await userModel.getById({ id });
    if (!user || user.length === 0) return false;

    return true;
}
