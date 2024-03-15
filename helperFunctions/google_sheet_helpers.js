const { google } = require('googleapis');
const { spreadsheetId } = require('../config.json');

/*  ----------------------
Google Drive/Sheets Setup
-------------------------- */
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
	scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/calendar.readonly"
    ],
})

// Sheets Auth
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });
const sheetsService = google.sheets({ version: 'v4', auth });
// Calendar Auth
const calendar = google.calendar({ version: "v3", auth });
const calendarId = "c2e4ddc715d346cd957fadf163edcded4b957fcb6381d5e4b5f503c660689de5@group.calendar.google.com";
// Drive Auth
const drive = google.drive({version: 'v3', auth});
const folderId = '1yru1fH2fYhCgTIGW5fvqiWDNeoPxDsaF'; // Specify your folder ID
/* ------------------- */

/*  ----------------------
Get Info From Master Member Tracking Sheet Functions
-------------------------- */
async function getRows() {
    // Grab data from Member Tracking Sheet
    const rows = await googleSheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: "A:G" // Do NOT modify this range unless you know what you're doing
    });
    return rows;
}

/*  ----------------------
Create User Function 
-------------------------- */
async function addUser(username, answers) {
    // get Google sheet columns
    const rows = await googleSheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: "A:B"
    });

    // find last row
    const lastRow = rows.data.values.length;

    googleSheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: spreadsheetId,
    range: "A:G",
    valueInputOption: "USER_ENTERED",
    resource: {
        majorDimension: "ROWS",
        values: [[lastRow, answers[0], "", answers[1], username, answers[2], answers[3], "", answers[4], answers[5], answers[6]]]
    } 
    })
}

/*  ----------------------
Get Email Function
-------------------------- */
async function getEmail(username) {
    // get Google sheet columns D and E (email and discord)
    const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "D:E"
    });

    // find the provided user in column E
    const data = rows.data.values.find(row => row[1] === username);
    // if user can be found
    if (data) {
        return data[0];
    } else {
        return null;
    }
}

async function getEvents() {
    // get next 15 events from calendars
    const res = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 15,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items;
}

/*  ----------------------
Workorder-Related Functions
-------------------------- */
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

async function findFirstEmptyRow(spreadsheetId) {
    try {
        const range = `I6:I`; // Adjust 'A' to your column of interest
        const response = await sheetsService.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        // 'values' is an array where each element is a row in the sheet in the specified range.
        // If a row is empty, it won't appear in 'values', so the first empty row is at the index
        // equal to the length of 'values' + 6 (since we started at row 6).
        const values = response.data.values || [];
        const firstEmptyRow = values.length + 6; // Adding 6 because array indices start at 0 and we started at row 6
        return firstEmptyRow;
    } catch (error) {
        console.error('Error finding the first empty row:', error);
        return null; // Return null or an appropriate value indicating failure
    }
}

async function getFirstSheetId(spreadsheetId) {
    try {
        const response = await sheetsService.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets.properties'
        });
        const sheets = response.data.sheets;
        if (sheets.length > 0) {
            return sheets[0].properties.sheetId; // Return the sheetId of the first sheet
        } else {
            console.error('No sheets found in the spreadsheet.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching sheet ID:', error);
        return null;
    }
}

async function updateSumFormula(spreadsheetId, range, formula) {
    try {
        await sheetsService.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED', // USER_ENTERED must be enabled to correctly set the formula for the cell
            resource: {
                values: [
                    [formula]
                ]
            }
        });
    } catch (error) {
        console.error('Error updating cell formula:', error);
    }
}

async function updateCell(spreadsheetId, cell, value){
    await sheetsService.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: cell,
        valueInputOption: 'RAW',
        resource: {
            values: [[value]] // Write the current link
        }
    });
}

async function copyRow(spreadsheetId, sheetId, sourceRowIndex, destinationRowIndex) {
    const requests = [{
        copyPaste: {
            source: {
                sheetId: sheetId,
                startRowIndex: sourceRowIndex - 1,
                endRowIndex: sourceRowIndex,
                startColumnIndex: 0,
                endColumnIndex: 9 
            },
            destination: {
                sheetId: sheetId,
                startRowIndex: destinationRowIndex - 1,
                endRowIndex: destinationRowIndex,
                startColumnIndex: 0,
                endColumnIndex: 9 
            },
            pasteType: 'PASTE_NORMAL', // Copy all cell contents and formatting
            pasteOrientation: 'NORMAL'
        }
    }];

    try {
        await sheetsService.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: requests
            }
        });
    } catch (error) {
        console.error('Error copying the row:', error);
        // Handle error
    }
}

async function copySheet(title, templateSpreadsheetId, folderId) {
    const result = await drive.files.copy({
        fileId: templateSpreadsheetId,
        requestBody: {
            name: title,
            parents: [folderId],
        },
    });

    // Share the copied spreadsheet with gmail account
    drive.permissions.create({
        fileId: result.data.id,
        requestBody: {
            type: 'user',
            role: 'writer', 
            emailAddress: 'electriummobility@gmail.com' // Gmail Account
        },
    });

    return result;
}

module.exports = {
    fetchSheetTitles,
    getSheetIdByTitle,
    findFirstEmptyRow,
    getFirstSheetId,
    updateSumFormula,
    updateCell,
    copyRow,
    addUser,
    getEmail,
    getEvents,
    getRows,
    copySheet
};