const { SlashCommandBuilder } = require('discord.js');
/*  ----------------------
Google Sheets Setup
-------------------------- */
const { spreadsheetId } = require('../../config.json');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });
/* ------------------- */


module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_user_info')
    .setDescription('Get user info from the Google Sheet!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we wish to get info on')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const username = await user.username;

    // get Google sheet columns A to G
    const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "A:G"
    });

    // find the provided user in column E
    const data = rows.data.values.find(row => row[4] === username);
    // if user can be found
    if (data) {
      const fullName = data[1];
      const email = data[3];
      const role = data[5];
      let team = data[6];
      if (!team) {
        team = "N/A";
      }
      await interaction.reply(`Full Name: ${fullName}\nEmail: ${email}\nRole: ${role}\nTeam: ${team}`);
    } else {
      await interaction.reply(`I couldn't find this user in the W24 member list :(`)
    }
	},
};