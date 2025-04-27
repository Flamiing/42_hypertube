import TorrentClient from '../src/Core/TorrentClient.js';

const torrentClient = new TorrentClient(
    '123',
    'http://www.publicdomaintorrents.com/bt/btdownload.php?type=torrent&file=Carnival_of_Souls_PSP.MP4.torrent'
);
await torrentClient.streamTorrent();
process.exit();
