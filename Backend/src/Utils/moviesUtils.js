// Third-Party Imports:
import axios from 'axios';

// Local Imports:
import { returnErrorStatus } from './errorUtils.js';
import StatusMessage from './StatusMessage.js';

export function isValidSource(res, accepted_sources, source) {
    if (!source)
        return returnErrorStatus(
            res,
            400,
            StatusMessage.MUST_INCLUDE_MOVIES_SOURCE
        );
    if (!accepted_sources.includes(source.toLowerCase()))
        return returnErrorStatus(res, 400, StatusMessage.INVALID_MOVIES_SOURCE);
    return true;
}

export async function fetchRawMovies(url) {
    const rawMovies = [];

    try {
        const response = await axios.get(url);
        const data = response.data.response.docs;
        rawMovies.push(...data);
    } catch (error) {
        console.error('ERROR:', error);
        return null;
    }

    return rawMovies;
}
