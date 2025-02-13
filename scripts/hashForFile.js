const crypto = require('crypto');
const fs = require('fs');

function generateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256'); // Use SHA-256 for uniqueness
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
}

const filePath = process.argv[2];
if (!filePath) {
        console.error("Usage: node script.js <path-to-audio-file>");
        process.exit(1);
}
generateFileHash(filePath).then((hash) => console.log(`File Hash: ${hash}`))
.catch((err) => console.error('Error:', err));