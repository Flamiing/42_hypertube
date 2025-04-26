// Local Imports:
import Model from '../Core/Model.js';

class MoviesModel extends Model {
    constructor() {
        super('movies');
    }

    async searchMovie(page, limit, search) {
        const searchPattern = `%${search}%`;
        const offset = (page - 1) * limit;
        const fields = [
            'id',
            'title',
            'year',
            'rating',
            'thumbnail',
            'popularity',
            'language',
            'genres'
        ];

        const query = {
            text: `SELECT ${fields} FROM ${this.table} WHERE title ILIKE $1 ORDER BY title DESC LIMIT ${limit} OFFSET $2;`,
            values: [searchPattern, offset],
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

const moviesModel = new MoviesModel();
export default moviesModel;
