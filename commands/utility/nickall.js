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
    	.setDescription("Sets the nickname of all users according to the Electrium spreadsheet data")
    	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  	async execute(interaction) {
		// 2024.02.09 Carl Wang
		// TODO: Find a way to obtain a user snowflake (ID) using a GuildMember fetch 
		// functionality, rather than obtaining the full list of Discord members in the
		// server because once the server exceeds 1000 members, this will NOT work			
		const discordmembers = new Map();
		const sheetmembers = new Map();

		// Use this until we can convert Discord username to snowflake
		// All of this crap just to get the Discord ID
		// I hate this approach so please find a way to not do this to 
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
			range: "A:G" // Do NOT modify this range unless you know what you're doing
		});
		
		rows.data.values.forEach((row, idx) => {
			// Skip headers
			if (idx === 0) return;
			
			// WatIAm => {FullName, DiscordIGN, Id (Pain in the fucking ass to obtain)}
			//                                  ^ Can't wait for someone to find an easier way for this
			let watiam = row[2];
			let fullname = row[1];
			let discord_username = row[4];

			// Quick checks
			if (
				// Check for undefined
				!watiam || !fullname || !discord_username ||

				// Check for empty values according to what Google Sheet does
				watiam === " " || fullname === " " || discord_username === " "
			) return;

			// Add to a list of members to have their Discord usernames changed to what is on Google Sheets
			if (row[0] !== " " && !sheetmembers.has(discord_username)) {
				sheetmembers.set(watiam, {name: fullname, username: discord_username, id: discordmembers.get(discord_username)});
			}
		});
		
		// Set nicknames
		for (const [key, val] of sheetmembers.entries()) {
			if (val.id) {
				if (val.id !== interaction.guild.ownerId) {
					interaction.guild.members.fetch(val.id)
					.then((res) => {
						// Set a nickname if the user has one or not
						if (!res.nickname) res.setNickname(val.name.substring(0, val.name.indexOf(" ")))
					})
				}
			}
		}

		interaction.reply({ content: "Success", ephemeral: true });
		return;
	},
};