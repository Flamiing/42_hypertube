// Third-Party Imports:
import axios from 'axios';

// Local Imports:
import { returnErrorStatus } from '../Utils/errorUtils.js';
import { isValidSource, fetchRawMovies } from '../Utils/moviesUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';
import watchedMoviesModel from '../Models/WatchedMoviesModel.js';

export default class LibraryController {
    static ACCEPTED_SOURCES = {
        'archive.org': LibraryController.getArchiveLibrary,
    };

    static async search(req, res) {
        const { query } = req.query;
        if (!query)
            return res
                .status(400)
                .json({ msg: StatusMessage.SEARCH_QUERY_REQUIRED });

        return res.json({ msg: 'SEARCH' });
    }

    static async library(req, res) {
        const userId = req.session.user.id;
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
            userId,
            page
        );
        if (!movies) return res;

        return res.json({ msg: movies });
    }

    static async getArchiveLibrary(res, userId, page) {
        const rows = 10;
        const url = `https://archive.org/advancedsearch.php?q=collection%3Afeature_films+AND+mediatype%3Amovies+AND+date%3A%5B*+TO+2025-01-01%5D&fl%5B%5D=title&fl%5B%5D=year&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=identifier&sort%5B%5D=downloads+desc&rows=${rows}&page=${page}&output=json`;

        const rawMovies = await fetchRawMovies(url);
        if (!rawMovies)
            return returnErrorStatus(
                res,
                502,
                StatusMessage.COULD_NOT_FETCH_MOVIES
            );

        const movies = await LibraryController.getMoviesInfo(userId, rawMovies);
        if (!movies)
            return returnErrorStatus(
                res,
                502,
                StatusMessage.COULD_NOT_FETCH_MOVIES_INFO
            );

        return movies;
    }

    static async getMoviesInfo(userId, rawMovies) {
        const { TMDB_API_KEY } = process.env;
        const movies = [];

        for (const rawMovie of rawMovies) {
            const tmdbSearchURL = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${rawMovie.title}&year=${rawMovie.year}`;
            try {
                const tmdbResponse = await axios.get(tmdbSearchURL);

                const movieData = tmdbResponse.data.results[0];
                if (!movieData) continue;
                const thumbnail = `https://image.tmdb.org/t/p/w185${movieData.poster_path}`;

                const movie = {
                    title: movieData.original_title || 'N/A',
                    year: rawMovie.year || 'N/A',
                    description: movieData.overview || 'N/A',
                    rating: movieData.vote_average || 'N/A',
                    thumbnail: thumbnail || 'N/A',
                    isWatched: await watchedMoviesModel.isMovieWatched(
                        userId,
                        rawMovie.identifier
                    ),
                    language: movieData.original_language,
                    downloads: rawMovie.downloads,
                    identifier: rawMovie.identifier, // Used to build the torrent download URL for archive.org
                };
                movies.push(movie);
            } catch (error) {
                console.error('ERROR:', error);
                return null;
            }
        }

        return movies;
    }
}
