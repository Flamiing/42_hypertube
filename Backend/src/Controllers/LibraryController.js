// Local Imports:
import { isValidSource, fetchRawMovies } from '../Utils/moviesUtils.js';

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
        const url = `https://archive.org/advancedsearch.php?q=collection%3A%22moviesandfilms%22+AND+date%3A%5B1990-01-01+TO+2025-01-01%5D&fl%5B%5D=creator&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=genre&fl%5B%5D=language&fl%5B%5D=name&fl%5B%5D=publisher&fl%5B%5D=title&fl%5B%5D=type&fl%5B%5D=year&sort%5B%5D=year+asc&rows=${rows}&page=${page}&output=json`;

        const rawMovies = await fetchRawMovies(url);

        return rawMovies;
    }
}
