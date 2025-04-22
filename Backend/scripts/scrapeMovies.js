import axios from 'axios';
import * as cheerio from 'cheerio';
import scrapedMoviesModel from '../src/Models/ScrapedMoviesModel.js';

const BASE_URL = 'https://www.publicdomaintorrents.info';
const CATEGORY_URL = `${BASE_URL}/nshowcat.html?category=ALL`;

async function scrapeMovies() {
  try {
    const { data } = await axios.get(CATEGORY_URL);
    const $ = cheerio.load(data);
    const movies = [];

    $('tr td').each((_, element) => {
        const linkElement = $(element).find('a');
        if (linkElement.text().length < 55 && linkElement.attr('href')?.includes('nshowmovie.html')) {
            const movieTitle = linkElement.text().trim();
            const movieURL = BASE_URL + '/' + linkElement.attr('href');
            const movie = {
                title: movieTitle,
                movie_url: movieURL
            }
            movies.push(movie);
        }
    });

    
    for (const movie of movies) {
        await scrapedMoviesModel.create({ input: movie });
        console.info(`${movie.title} saved to the DB!`)
    }
    console.info('All movies have been saved into the BD!')
  } catch (error) {
    console.error('Scraping error:', error);
  }
}

await scrapeMovies();
process.exit()