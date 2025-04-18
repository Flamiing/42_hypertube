import { returnErrorStatus } from './errorUtils.js';

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
