const { SlashCommandBuilder } = require('discord.js');
const { copySheet } = require('../../helperFunctions/google_sheet_helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startworkorder')
        .setDescription('Creates a work order template on Google Sheets')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The title of the google sheet to set to')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const title = interaction.options.getString('title');
        const templateSpreadsheetId = '1Fe80WUurIxBpamfO8KW-JXHpKwyi0542UbdPNqVH57o'; /* Id of the spreadsheet that we will copy */
        const folderId = '1yru1fH2fYhCgTIGW5fvqiWDNeoPxDsaF'; /* Template folder id */ 

        // Use the Drive API to copy the template spreadsheet
        const copiedSheet = await copySheet(title, templateSpreadsheetId, folderId);

        // Reply with the spreadsheet link
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${copiedSheet.data.id}/edit`;
        await interaction.editReply(`Workorder: ${title} has been successfully created. Access it here: ${spreadsheetUrl}`);
    }
};