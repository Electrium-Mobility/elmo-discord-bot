const { SlashCommandBuilder } = require('discord.js');

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

const driveService = google.drive({ version: 'v3', auth }); 
/* ------------------- */

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
        const templateSpreadsheetId = '1Fe80WUurIxBpamfO8KW-JXHpKwyi0542UbdPNqVH57o';
        const folderId = '1yru1fH2fYhCgTIGW5fvqiWDNeoPxDsaF';

        // Use the Drive API to copy the template spreadsheet
        const copiedSheet = await driveService.files.copy({
            fileId: templateSpreadsheetId,
            requestBody: {
                name: title,
                parents: [folderId],
            },
        });

        // Share the copieds spreadsheet with your gmail account
        await driveService.permissions.create({
            fileId: copiedSheet.data.id,
            requestBody: {
                type: 'user',
                role: 'writer', 
                emailAddress: 'electriummobility@gmail.com' // Gmail Account
            },
        });

        // Reply with the spreadsheet link
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${copiedSheet.data.id}/edit`;
        await interaction.editReply(`Workorder: ${title} has been successfully created. Access it here: ${spreadsheetUrl}`);
    }
};