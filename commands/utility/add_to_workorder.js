const { SlashCommandBuilder } = require('discord.js');
const { getSheetIdByTitle, findFirstEmptyRow, getFirstSheetId, updateCell, copyRow } = require('../../helperFunctions/google_sheet_helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addtoworkorder')
        .setDescription('Adds work order to a pre-existing Google sheet')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The Google sheet we are adding the work order to')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('links')
                .setDescription('The links to the items that we want to add to the Google sheet')
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