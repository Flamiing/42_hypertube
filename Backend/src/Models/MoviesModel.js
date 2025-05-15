// Local Imports:
import Model from '../Core/Model.js';
import { getSearchValues, getMoviesOrder } from '../Utils/moviesUtils.js';

class MoviesModel extends Model {
    constructor() {
        super('movies');
    }

    async searchMovies(page, limit, userQuery) {
        const searchPattern = `%${userQuery}%`;
        const offset = (page - 1) * limit;
        const orderedBy = getMoviesOrder(userQuery.orderedBy);
        if (!orderedBy) return null;

        const result = getSearchValues(userQuery);
        const searchQueries = result.searchQueries;
        let values = result.values;
        console.log('TEST: ', result);
        const fields = [
            'id',
            'title',
            'year',
            'rating',
            'thumbnail',
            'popularity',
            'language',
            'genres',
        ];

        values.push(offset);
        const offsetReference = `$${values.length}`;

        const query = {
            text: `SELECT ${fields} FROM ${this.table} WHERE ${searchQueries} ORDER BY ${orderedBy} DESC LIMIT ${limit} OFFSET ${offsetReference};`,
            values: values,
        };

        console.log('TEST QUERY:', query.text)

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
