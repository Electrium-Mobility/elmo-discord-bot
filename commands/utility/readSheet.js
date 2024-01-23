const { SlashCommandBuilder } = require('discord.js');
const { spreadsheetId } = require('../../config.json');
const { google } = require('googleapis');

// Google Sheets Authorisation
const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('read_sheet')
    .setDescription('Reads a value from the Google Sheet!')
    .addIntegerOption(option => option
        .setName("number")
        .setDescription('Member Number')
        .setRequired(true)
    ),
  async execute(interaction) {
    const memberNumber = interaction.options.getInteger('number');
    const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "A:B"
    });
    
    const data = rows.data.values;
    const ans = data[memberNumber][1];
    await interaction.reply(`The member at number ${memberNumber} is ${ans}.`);
	},
};