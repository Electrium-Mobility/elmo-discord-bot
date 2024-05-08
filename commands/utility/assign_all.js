const { SlashCommandBuilder, PermissionFlagsBits, Guild } = require('discord.js');
const { getRows } = require('../../helperFunctions/google_sheet_helpers.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assignall')
		.setDescription('Assigns roles for users from spreadsheet')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	
	async execute(interaction) {
		const discordmembers = new Map();

		// Using workaround method from nickall to get user ID, rework this later
		let discordmembers_get = (await interaction.guild.members.list({ limit: 1000 }));
		for (let x of discordmembers_get) {
			let username = x[1].user.username;
			let id = x[1].user.id;
			discordmembers.set(username, id);
		}

		// get rows from sheet
		let rows = await getRows();
		let entries = rows.data.values;

		// iterate through sheet
		for (let data of entries) {
			// get user id from username
			let userID = discordmembers.get(data[4]);

			// array of roles to assign
			let rolesToAssign = [];
			if (data[5]) rolesToAssign.push(data[5]);
			if (data[6]) rolesToAssign.push(data[6]);

			// if userID was found
			if (userID) {
				// assign the user the role
				for (let position of rolesToAssign) {
					let roleName = position.toLowerCase().replace(/\s/g, "-");
					let role = interaction.guild.roles.cache.find(role => role.name === roleName);
					// if roleid isnt found, let roleid be the general member role id
					let roleId = role ? role.id : "1039687620629889057";

					// get the user object from the guild
					interaction.guild.members.fetch(userID)
						.then((res) => {
							res.roles.add(roleId);
						});
				}
			} else {
				// console log emails of ppl who aren't on discord
				console.log(data[3]);
			} 
		}
		
		await interaction.reply({ content: "Command has run successfully.", ephemeral: true });
	}
};