import axios from 'axios';
import * as cheerio from 'cheerio';
import scrapedMoviesModel from '../src/Models/ScrapedMoviesModel.js';

const BASE_URL = 'https://www.publicdomaintorrents.info';
const CATEGORY_URL = `${BASE_URL}/nshowcat.html?category=ALL`;

async function getMoviesURL() {
    try {
        const { data } = await axios.get(CATEGORY_URL);
        const $ = cheerio.load(data);
        const moviesURLs = [];

        $('tr td').each((_, element) => {
            const linkElement = $(element).find('a');
            if (
                linkElement.text().length < 55 &&
                linkElement.attr('href')?.includes('nshowmovie.html')
            ) {
                const movieURL = BASE_URL + '/' + linkElement.attr('href');
                moviesURLs.push(movieURL);
            }
        });

        return moviesURLs;
    } catch (error) {
        console.error('Scraping error:', error);
    }
}

async function scrapMovieData(movieURL) {
    try {
        const { data } = await axios.get(movieURL);
        const $ = cheerio.load(data);
        const scrapedMovieData = {};

        $('tr td h3').each((_, element) => {
            scrapedMovieData['title'] = $(element).text().trim();
        });

        $('tr td').each((_, element) => {
            const linkElement = $(element).find('a');
            if (linkElement.attr('href')?.includes('PSP.MP4.torrent')) {
                scrapedMovieData['torrent_url'] = linkElement.attr('href');
            }
        });

        return scrapedMovieData;
    } catch (error) {
        console.error('Scraping error:', error);
    }
}

async function getMoviesInfo(moviesURLs) {
    for (const movieURL of moviesURLs) {
        const scrapedMovieData = await scrapMovieData(movieURL);
        const TMDBMovieData = await getTMDBMovieInfo;
    }
}

export async function getPublicDomainTorrentsMovies(movieGenres) {
    const moviesURLs = await getMoviesURL();

    const movies = await getMoviesInfo(moviesURLs);
}
