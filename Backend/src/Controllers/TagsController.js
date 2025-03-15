// Local Imports:
import tagsModel from '../Models/TagsModel.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class TagsController {
    static async getAllTags(req, res) {
        const tags = await tagsModel.getAll();
        if (tags) return res.json({ msg: tags });
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }
}
