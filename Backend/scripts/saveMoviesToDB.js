// Third-Party Imports:
import axios from 'axios';
import { getPublicDomainTorrentsMovies } from './getPublicDomainTorrentsMovies.js';

// Local Imports:

async function getMovieGenres() {
    const { TMDB_API_KEY } = process.env;
    const TMDBGenresURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en`;
    const movieGenres = {};

    try {
        const tmdbResponse = await axios.get(TMDBGenresURL);

        const genresData = tmdbResponse.data.genres;
        for (const genreData of genresData) {
            movieGenres[genreData.id] = genreData.name;
        }
        return movieGenres;
    } catch (error) {
        console.error('ERROR:', error);
        return null;
    }
}

async function saveMoviesToDB() {
    const movieGenres = await getMovieGenres();

    await getPublicDomainTorrentsMovies(movieGenres);
}

await saveMoviesToDB();
process.exit();
