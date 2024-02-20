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
                .setDescription('The link of the order that we want to add to the Google sheet (If you want to add multiple links seperate them by a space)')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const title = interaction.options.getString('title');
        const sheetId = await getSheetIdByTitle(title);
        const linksString = interaction.options.getString('links');
        const links = linksString.split(' '); // Store links in a link array     
        if (!sheetId) {
            await interaction.editReply(`Could not find a sheet with the title "${title}".`);
            return;
        }

        try {
            let currentRow = 6; // Starting row
            for (const link of links) {
                if (currentRow > 9){
                    await copyRow(sheetId, 1915737961, currentRow + 1, currentRow + 2);
                    await updateSumFormula(sheetId, `H${currentRow+3}`, `=SUM(H6:H${currentRow+2})`);
                    await copyRow(sheetId, 1915737961, currentRow, currentRow + 1);
                    await updateCell(sheetId, `A${currentRow+2}`, currentRow + 2 - 5);
                    await copyRow(sheetId, 1915737961, currentRow-1, currentRow);
                    await updateCell(sheetId, `A${currentRow+1}`, currentRow + 1 - 5);
                }
                const range = `I${currentRow}`; // Dynamic range for each link
                updateCell(sheetId, range, link);
                currentRow++; // Move to the next row for the next iteration
            }

            // Reply with the spreadsheet link
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
            await interaction.editReply(`Workorder: ${title} has been successfully modified. Access it here: ${spreadsheetUrl}`);
        } catch (error) {
            console.error('Error updating the spreadsheet:', error);
            await interaction.editReply(`Failed to modify the work order in the spreadsheet.`);
        }
    }

};

async function updateSumFormula(spreadsheetId, range, formula) {
    try {
        await sheetsService.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED', // Use 'USER_ENTERED' to interpret the value as if it were entered into the Google Sheets UI, allowing formulas to be interpreted correctly
            resource: {
                values: [
                    [formula] // The formula, for example, '=SUM(I6:I100)'
                ]
            }
        });
        console.log("Cell formula updated successfully.");
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
                startRowIndex: sourceRowIndex,
                endRowIndex: sourceRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 9 // Adjust this based on the number of columns you need to copy
            },
            destination: {
                sheetId: sheetId,
                startRowIndex: destinationRowIndex,
                endRowIndex: destinationRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: 9 // Ensure this matches the source range
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


