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
		const discordmembers = new Map();
		const sheetmembers = new Map();

		// Use this until we can convert Discord username to snowflake
		// All of this crap just to get the Discord ID
		// I hate this approach so please find a way to not do this
		let discordmembers_get = (await interaction.guild.members.list({limit: 1000}));
		for (let x of discordmembers_get) {
			let username = x[1].user.username;
			let id = x[1].user.id;
			discordmembers.set(username, id);
		}

		// Grab data from Google Sheets
		const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "A:G" // Do not modify this range
		});
		
		rows.data.values.forEach((row, idx) => {
			// Skip headers
			if (idx === 0) return;
			
			// WatIAm => {FullName, DiscordIGN, Id (Pain in the fucking ass to obtain)}
			//                                  ^ Can't wait for someone to find an easier way for this
			let watiam = row[2];
			let fullname = row[1];
			let discord_username = row[4]
			if (row[0] != " " && !sheetmembers.has(discord_username)) {
				sheetmembers.set(watiam, {name: fullname, username: discord_username, id: discordmembers.get(discord_username)})
			}
		});
		
		// Set nicknames
		for (const [key, val] of sheetmembers.entries()) {
			if (val.id) {
				if (val.id !== interaction.guild.ownerId) {
					// console.log(`Setting Discord username ${key} with ID ${val.id} to ${val.name.substring(0, val.name.indexOf(" "))}`);
					interaction.guild.members.fetch(val.id)
						.then((res) => {
								res.setNickname(val.name.substring(0, val.name.indexOf(" ")))
							}
						)
				}
			}
		}

		interaction.reply({ content: "Success", ephemeral: true });
		return;
	},
};