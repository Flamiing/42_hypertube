// Local Imports:
import StatusMessage from "../Utils/StatusMessage.js";

export default class LibraryController {
    static ACCEPTED_SOURCES = [
        'archive.org'
    ]

    static async library(req, res) {
        const { source } = req.query;
        if (!source)
            return res.status(400).json({ msg: StatusMessage.MUST_INCLUDE_MOVIES_SOURCE })
        if (!LibraryController.ACCEPTED_SOURCES.includes(source.toLowerCase()))
            return res.status(400).json({ msg: StatusMessage.INVALID_MOVIES_SOURCE })

        return res.json({ msg: 'LIBRARY' })
    }
}
