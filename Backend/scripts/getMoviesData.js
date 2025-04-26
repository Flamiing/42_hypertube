// Third-Party Imports:
import axios from 'axios';
import { getPublicDomainTorrentsMovies } from './getPublicDomainTorrentsMovies.js';
import { getArchiveMovies } from './getArchiveMovies.js';

// Local Imports:
import moviesModel from '../src/Models/MoviesModel.js';

async function getMoviesData() {
    const movieGenres = await getMovieGenres();

    if (await areMoviesInDB()) {
        console.info('The DB already has movies.');
        process.exit();
    }
    await getArchiveMovies(movieGenres);
    await getPublicDomainTorrentsMovies(movieGenres);
}

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

async function areMoviesInDB() {
    const result = await moviesModel.countRecordsInTable();
    if (result > 0) return true;
    return false;
}

await getMoviesData();
process.exit();
