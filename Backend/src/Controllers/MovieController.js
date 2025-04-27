// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import likedMoviesModel from '../Models/LikedMoviesModel.js';

export default class LibraryController {
    static async moviePage(req, res) {
        const userId = req.session.user.id;
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const movie = await moviesModel.getById({ id });
        console.log('TEST - 84554117-1237-4f13-9221-606e5655da33:', id);
        if (!movie)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (movie.length === 0)
            return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });

        const isLiked = await likedMoviesModel.isMovieLiked(userId, movie.id);
        movie.isLiked = isLiked;

        return res.json({ msg: movie });
    }
}
