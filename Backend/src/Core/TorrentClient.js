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
        const torrent = await this.#openTorrent();

        this.#getPeers(torrent, peers => {
            console.log('Got peers:', peers);
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

    async #openTorrent() {
        await this.#downloadTorrentFile();

        try {
            const torrent = bencode.decode(fsExtra.readFileSync(this.torrentFilePath), { decodeStrings: false });
            return torrent;
        } catch (error) {
            console.error(
                'Error reading or parsing the torrent file:',
                error.message
            );
            return null;
        }
    }

    #infoHash(torrent) {
        const info = bencode.encode(torrent.info);
        return crypto.createHash('sha1').update(info).digest();
    }

    #getSize(torrent) {
        const { length, files } = torrent.info;
        return length || files.map(f => f.length).reduce((a, b) => a + b, 0);
    }

    #pieceLength(torrent) {
        return torrent.info['piece length'];
    }

    #getPeers(torrent, callback) {
        const announceUrl = 'https://tracker.opentrackr.org:443/announce';//torrent.announce.toString();
        const parsed = URL.parse(announceUrl);
        const infoHash = this.#infoHash(torrent);
        const peerId = this.#generateId();
        const port = 6881;
    
        const query = new URLSearchParams({
            info_hash: infoHash.toString('binary'),
            peer_id: peerId.toString('binary'),
            port,
            uploaded: 0,
            downloaded: 0,
            left: this.#getSize(torrent),
            compact: 1
        });
    
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: `${parsed.path}?${query.toString()}`,
            method: 'GET'
        };
    
        const req = http.request(options, res => {
            let response = [];
            res.on('data', chunk => response.push(chunk));
            res.on('end', () => {
                const data = Buffer.concat(response);
                const trackerResponse = require('bencode').decode(data);
                const peers = parsePeers(trackerResponse.peers);
                callback(peers);
            });
        });
    
        req.on('error', console.error);
        req.end();
    }
      
    #generateId() {
        return Buffer.from('-JS0001-' + crypto.randomBytes(12).toString('hex').slice(0, 12));
    }
      
    #parsePeers(peersBuffer) {
        const peers = [];
        for (let i = 0; i < peersBuffer.length; i += 6) {
            const ip = peersBuffer.slice(i, i + 4).join('.');
            const port = peersBuffer.readUInt16BE(i + 4);
            peers.push({ ip, port });
        }
        return peers;
    }
    
    // Parse .torrent (bencode) DONE
    // Talk to trackers
    // Connect to peers (TCP handshake + bitfield messages)
    // Download pieces
    // Verify SHA-1
    // Stream/save pieces while downloading
}
