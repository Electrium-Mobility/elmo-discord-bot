const { SlashCommandBuilder } = require('discord.js');
const { getSheetIdByTitle } = require('../../helperFunctions/fetch_sheet_titles');
/*  ----------------------
Google Sheets Setup
-------------------------- */
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
	scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"],
})

const sheetsService = google.sheets({ version: 'v4', auth });
/* ------------------- */

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addworkorder')
        .setDescription('Adds work order to a pre-existing Google sheet')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The Google sheet we are adding the work order to')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('links')
                .setDescription('The link of the order that we want to add to the Google sheet')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const title = interaction.options.getString('title');
        const spreadSheetId = await getSheetIdByTitle(title);
        const sheetId = await getFirstSheetId(spreadSheetId);
        const linksString = interaction.options.getString('links');
        const links = linksString.split(' '); // Store links in a link array     
        
        if (!spreadSheetId) {
            await interaction.editReply(`Could not find a sheet with the title "${title}".`);
            return;
        }

        try {
            let currentRow = await findFirstEmptyRow(spreadSheetId);
            for (const link of links) {
                if (currentRow > 9){ // Creates more rows in the table if were almost out of rows
                    await copyRow(spreadSheetId, sheetId, currentRow + 2, currentRow + 3);
                    await updateSumFormula(spreadSheetId, `H${currentRow + 3}`, `=SUM(H6:H${currentRow + 2})`); // Updates the total cell =SUM calculation
                    await copyRow(spreadSheetId, sheetId, currentRow + 1, currentRow + 2);
                    await updateCell(spreadSheetId, `A${currentRow + 2}`, currentRow - 3);
                    await copyRow(spreadSheetId, sheetId, currentRow, currentRow + 1);
                    await updateCell(spreadSheetId, `A${currentRow + 1}`, currentRow - 4);
                }
                const cell = `I${currentRow}`; // The cell we are currently writing to in this iteration
                await updateCell(spreadSheetId, cell, link);
                currentRow++;
            }
            // Reply with the spreadsheet link
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadSheetId}/edit`;
            await interaction.editReply(`Workorder: ${title} has been successfully modified. Access it here: ${spreadsheetUrl}`);
        } catch (error) {
            console.error('Error updating the spreadsheet:', error);
            await interaction.editReply(`Failed to modify the work order in the spreadsheet.`);
        }
    }

};

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


