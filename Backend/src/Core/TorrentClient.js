// Third-Party Imports:
import axios from "axios";
import fsExtra from 'fs-extra';
import https from 'https';

export default class TorrentClient {
    constructor(movieId, torrentURL) {
        this.movieId = movieId
        this.torrentURL = torrentURL.replace(/^http:/, "https:");
    }

    async streamTorrent() {
        await this.#downloadTorrentFile()
    }

    async #downloadTorrentFile() {
        const { MOVIES_PATH } = process.env;
        const moviePath = `${MOVIES_PATH}/${this.movieId}.torrent`

        try {
            const redirectRes = await axios.get(this.torrentURL);
            const torrentFileURL = redirectRes.request.res.responseUrl;

            return new Promise((resolve, reject) => {
                const request = https.get(torrentFileURL, (response) => {
                    if (response.statusCode !== 200) {
                        return reject(`HTTP ${response.statusCode}`);
                    }
                    
                    const file = fsExtra.createWriteStream(moviePath);
                    response.pipe(file);

                    file.on('finish', () => {
                        file.close(resolve);
                    });
                }).on('error', (error) => {
                    fsExtra.unlink(moviePath, () => reject(error));
                });
            });
        } catch (error) {
            console.error('Error downloading torrent file:', error.message);
        }
    }

    parseTorrent() {
        
    }

    // Parse .torrent (bencode)
    // Talk to trackers
    // Connect to peers (TCP handshake + bitfield messages)
    // Download pieces
    // Verify SHA-1
    // Stream/save pieces while downloading
}