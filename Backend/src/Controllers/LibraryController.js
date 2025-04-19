// Local Imports:
import { returnErrorStatus } from '../Utils/errorUtils.js';
import { isValidSource, fetchRawMovies } from '../Utils/moviesUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';

export default class LibraryController {
    static ACCEPTED_SOURCES = {
        'archive.org': LibraryController.getArchiveLibrary,
    };

    static async library(req, res) {
        const { source } = req.query;
        const page = req.params.page || 1;

        if (
            !isValidSource(
                res,
                Object.keys(LibraryController.ACCEPTED_SOURCES),
                source
            )
        )
            return res;

        const movies = await LibraryController.ACCEPTED_SOURCES[source](
            res,
            page
        );
        if (!movies) return res;

        return res.json({ msg: movies });
    }

    static async getArchiveLibrary(res, page) {
        const rows = 50;
        const url = `https://archive.org/advancedsearch.php?q=collection%3Afeature_films+AND+mediatype%3Amovies+AND+date%3A%5B*+TO+2025-01-01%5D&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description&sort%5B%5D=downloads+desc&rows=${rows}&page=${page}&output=json`;

        const rawMovies = await fetchRawMovies(url);
        if (!rawMovies) return returnErrorStatus(res, 502, StatusMessage.COULD_NOT_FETCH_MOVIES);

        //const movies = await getMoviesInfo(rawMovies);
        //if (!movies) return returnErrorStatus(res, 502, StatusMessage.COULD_NOT_FETCH_MOVIES_INFO)

        return rawMovies;
    }

    /* static async getMoviesInfo(rawMovies) {
        const movies = [];

        for (const rawMovie of rawMovies) {
            const movie = {

            }
        }
    } */
}
