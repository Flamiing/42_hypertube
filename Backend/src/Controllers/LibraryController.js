// Local Imports:
import { isValidSource } from '../Utils/moviesUtils.js';

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

        const movies = LibraryController.ACCEPTED_SOURCES[source](res, page);
        if (!movies) return res;

        return res.json({ msg: 'LIBRARY' });
    }

    static async getArchiveLibrary(res, page) {}
}
