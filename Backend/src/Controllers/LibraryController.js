// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';

export default class LibraryController {
    static async search(req, res) {
        return res.json({ msg: 'SEARCH' });
    }

    static async library(req, res) {
        const { page } = req.params;
        if (isNaN(page))
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const fields = ['title', 'year', 'rating', 'thumbnail'];
        const movies = await moviesModel.getPaginatedRecords(
            page,
            6,
            'popularity',
            'DESC',
            fields
        );
        if (!movies)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        return res.json({ msg: movies });
    }
}
