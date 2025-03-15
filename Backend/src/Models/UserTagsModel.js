// Local Imports:
import Model from '../Core/Model.js';
import tagsModel from '../Models/TagsModel.js';

class UserTagsModel extends Model {
    constructor() {
        super('user_tags');
    }

    async updateUserTags(userId, tags) {
        const addResult = await this.addTags(userId, tags);
        if (!addResult) return null;
        if (!addResult.length === 0) return [];

        const removeResult = await this.removeTags(userId, tags);
        if (!removeResult) return null;

        return true;
    }

    async addTags(userId, tags) {
        if (!tags) return [];
        for (const id of tags) {
            const validTag = await tagsModel.getById({ id });
            if (!validTag) return null;
            if (validTag.length === 0) return [];

            const input = { user_id: userId, tag_id: id };
            const userTag = await this.getByReference(input, true);
            if (!userTag) return null;
            if (userTag.length !== 0) continue;
            const result = await this.create({ input });
            if (!result) return null;
        }

        return true;
    }

    async removeTags(userId, tags) {
        const currentTagsResult = await this.getByReference(
            { user_id: userId },
            false
        );
        if (!currentTagsResult) return null;
        const currentTags = currentTagsResult.map((item) => item.tag_id);

        const tagsToDelete = currentTags.filter((item) => !tags.includes(item));
        for (const id of tagsToDelete) {
            const deleteResult = await this.deleteByReference({
                user_id: userId,
                tag_id: id,
            });
            if (!deleteResult) return null;
        }

        return true;
    }

    async getUserTags(userId) {
        const query = {
            text: `SELECT
                tags.id AS id,
                tags.value AS value
            FROM
                user_tags
            INNER JOIN
                tags
            ON
                user_tags.tag_id = tags.id
            WHERE
                user_tags.user_id = '${userId}';`,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];
            return result.rows;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }
}

const userTagsModel = new UserTagsModel();
export default userTagsModel;
