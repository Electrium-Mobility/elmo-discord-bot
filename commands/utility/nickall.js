const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
/*  ----------------------
Google Sheets Setup
-------------------------- */
const { spreadsheetId } = require("../../config.json");
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });
/* ------------------- */

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nickall")
    	.setDescription("Sets the nickname of all users according to the Electrium spreadsheet data"),
    	// .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  	async execute(interaction) {
		const members = await interaction.guild.members.list({limit: 1000});
		console.log(members);
		return;
		console.log(membersList);
		return;
		membersList.members.forEach(member => {
			discordid = member.user.username
		})

		const user = interaction.options.getUser("user");
		const username = await user.username;

		// Get Google sheet columns A to G
		const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "A:G"
		});

		// Find the provided user in column E
		const data = rows.data.values.find(row => row[4] === username);
		// If user can be found
		if (data) {
			const fullName = data[1];
			const email = data[3];
			const role = data[5];
			let team = data[6];
			if (!team) {
				team = "N/A";
			}
			await interaction.reply(`Full Name: ${fullName}\nEmail: ${email}\nRole: ${role}\nTeam: ${team}`);
		}
	},
};