const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
/*  ----------------------
Google Sheets Setup
-------------------------- */
//const { spreadsheetId } = require('../../config.json');
const spreadsheetId = process.env.SPREADSHEET_ID;
const { google } = require('googleapis');
const credentials = JSON.parse(Buffer.from(process.env.CREDENTIALS_JSON_BASE64, 'base64').toString('utf-8'));

const auth = new google.auth.GoogleAuth({
	//keyFile: "./credentials.json",
    credentials: credentials,
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });
/* ------------------- */


module.exports = {
	data: new SlashCommandBuilder()
		.setName('getuserinfo')
    .setDescription('Get user info from the Google Sheet!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we wish to get info on')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
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
