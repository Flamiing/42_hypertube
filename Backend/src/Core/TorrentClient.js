// Third-Party Imports:
import axios from 'axios';
import fsExtra from 'fs-extra';
import https from 'https';
import http from 'http';
import bencode from 'bencode';
import crypto from 'crypto';
import { URL } from 'url';

export default class TorrentClient {
    constructor(movieId, torrentURL) {
        const { MOVIES_PATH } = process.env;

        this.movieId = movieId;
        this.torrentFilePath = `${MOVIES_PATH}/${this.movieId}.torrent`;
        this.torrentURL = torrentURL.replace(/^http:/, 'https:');
    }

    async streamTorrent() {
        const torrent = await this.#parseTorrent();

        this.#getPeers(torrent, (trackerResponse) => {
            console.log(trackerResponse);
        });
    }

    async #downloadTorrentFile() {
        try {
            const redirectRes = await axios.get(this.torrentURL);
            const torrentFileURL = redirectRes.request.res.responseUrl;

            return new Promise((resolve, reject) => {
                const request = https
                    .get(torrentFileURL, (response) => {
                        if (response.statusCode !== 200) {
                            return reject(`HTTP ${response.statusCode}`);
                        }

                        const file = fsExtra.createWriteStream(
                            this.torrentFilePath
                        );
                        response.pipe(file);

                        file.on('finish', () => {
                            file.close(resolve);
                        });
                    })
                    .on('error', (error) => {
                        fsExtra.unlink(this.torrentFilePath, () =>
                            reject(error)
                        );
                    });
            });
        } catch (error) {
            console.error('Error downloading torrent file:', error.message);
        }
    }

    async #parseTorrent() {
        await this.#downloadTorrentFile();

        try {
            const torrentFile = fsExtra.readFileSync(this.torrentFilePath);
            const torrent = bencode.decode(torrentFile, {
                decodeStrings: false,
            });
            return torrent;
        } catch (error) {
            console.error(
                'Error reading or parsing the torrent file:',
                error.message
            );
            return null;
        }
    }

    #getPeers(torrent, callback) {
        const trackers = Array.isArray(torrent.announce)
            ? torrent.announce
            : [torrent.announce];

        // Add public trackers
        const publicTrackers = [
            'http://tracker.opentrackr.org:1337/announce',
            'http://tracker.bt4g.com:2095/announce',
            'http://open.acgnxtracker.com:80/announce',
            'http://tracker2.dler.org:80/announce',
            'http://t.nyaatracker.com:80/announce',
            'http://tracker.edwardans.com:80/announce',
            'https://tracker.imgoingto.icu:443/announce',
            'https://t.quic.ws:443/announce',
            'https://tracker.sloppyta.co:443/announce',
            'https://opentracker.xyz:443/announce',
        ];

        const allTrackers = publicTrackers; //[...trackers, ...publicTrackers];

        const infoEncoded = bencode.encode(torrent.info);
        const infoHash = crypto.createHash('sha1').update(infoEncoded).digest();
        const peerId = crypto.randomBytes(20);
        const port = 6881;

        const totalLength =
            torrent.info.length ||
            (torrent.info.files?.reduce((sum, f) => sum + f.length, 0) ?? 0);

        const queryParams =
            `info_hash=${this.#percentEncode(infoHash)}` +
            `&peer_id=${this.#percentEncode(peerId)}` +
            `&port=${port}` +
            `&uploaded=0&downloaded=0&left=${totalLength}` +
            `&compact=1`;

        for (const announce of allTrackers) {
            try {
                const announceURL = Buffer.isBuffer(announce)
                    ? announce.toString('utf-8')
                    : String(announce);

                if (!announceURL.startsWith('http')) {
                    console.warn(
                        '[TRACKER] Skipping unsupported URL (likely UDP):',
                        announceURL
                    );
                    continue;
                }

                const parsedURL = new URL(announceURL);
                const isHttps = parsedURL.protocol === 'https:';
                const requestLib = isHttps ? https : http;

                const fullPath = `${parsedURL.pathname}?${queryParams}`;

                const options = {
                    hostname: parsedURL.hostname,
                    port: parsedURL.port || (isHttps ? 443 : 80),
                    path: fullPath,
                    method: 'GET',
                    timeout: 5000,
                };

                console.log(
                    '[TRACKER] Requesting peers from:',
                    `${parsedURL.hostname}${fullPath}`
                );

                const req = requestLib.request(options, (res) => {
                    const chunks = [];

                    res.on('data', (chunk) => chunks.push(chunk));
                    res.on('end', () => {
                        const response = Buffer.concat(chunks);
                        try {
                            const trackerResponse = bencode.decode(response);
                            callback(trackerResponse);
                        } catch (e) {
                            console.error(
                                '[TRACKER] Failed to decode response from',
                                announceURL,
                                ':',
                                e.message
                            );
                        }
                    });
                });

                req.on('error', (err) => {
                    console.error(
                        '[TRACKER] Request error from',
                        announceURL,
                        ':',
                        err.message
                    );
                });

                req.end();
            } catch (e) {
                console.error(
                    '[TRACKER] Error handling tracker URL:',
                    e.message
                );
            }
        }
    }

    #percentEncode(buffer) {
        return Array.from(
            buffer,
            (byte) => `%${byte.toString(16).padStart(2, '0')}`
        ).join('');
    }

    // Parse .torrent (bencode) DONE
    // Talk to trackers
    // Connect to peers (TCP handshake + bitfield messages)
    // Download pieces
    // Verify SHA-1
    // Stream/save pieces while downloading
}
