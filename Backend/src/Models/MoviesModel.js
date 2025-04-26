// Local Imports:
import Model from '../Core/Model.js';

class MoviesModel extends Model {
    constructor() {
        super('movies');
    }
}

const moviesModel = new MoviesModel();
export default moviesModel;
