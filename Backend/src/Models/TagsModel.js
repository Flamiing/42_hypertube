// Local Imports:
import Model from '../Core/Model.js';

class TagsModel extends Model {
    constructor() {
        super('tags');
    }
}

const tagsModel = new TagsModel();
export default tagsModel;
