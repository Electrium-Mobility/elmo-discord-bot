const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserInfo } = require('../../helperFunctions/google_sheet_helpers.js');

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
    
    let data = await getUserInfo(username);
    // if user can be found
    if (data) {
      const fullName = data[1];
      const email = data[3];
      const role = data[5];
      let team = data[6];
      if (!team) {
        team = "N/A";
      }
      await interaction.reply({ content: `Full Name: ${fullName}\nEmail: ${email}\nRole: ${role}\nTeam: ${team}`, ephemeral: true });
    } else {
      await interaction.reply({ content: `I couldn't find this user in the W24 member list :(`, ephemeral: true });
    }
	},
};