const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
	scopes: [
        "https://www.googleapis.com/auth/drive"],
})
const drive = google.drive({version: 'v3', auth});
const folderId = '1yru1fH2fYhCgTIGW5fvqiWDNeoPxDsaF'; // Specify your folder ID

async function fetchSheetTitles() {
    // Assuming auth is already set up for Google Drive API
    const response = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    return response.data.files.map(file => file.name);
}

async function getSheetIdByTitle(title) {
    try {
        const response = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${title}' and '${folderId}' in parents`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const files = response.data.files;
        if (files.length > 0) {
            return files[0].id; // or handle multiple matches as needed
        } else {
            console.log('No matching Google Sheets found.');
            return null;
        }
    } catch (error) {
        console.error('The API returned an error: ' + error);
        throw error; // or handle error appropriately
    }
}

module.exports = { fetchSheetTitles, getSheetIdByTitle };