const { google } = require('googleapis');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const drive = google.drive('v3');


async function authenticateDrive() {
    const auth = await authenticate({
        keyfilePath: path.join(__dirname, 'oauth2.keys.json'),
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.appdata',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/drive.photos.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
        ],
    });
    google.options({ auth });
    return drive;
}
module.exports = authenticateDrive;