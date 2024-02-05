const { SlashCommandBuilder, PermissionFlagsBits, Guild } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assignrole')
    .setDescription('Assigns a role for a user on Discord')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we want to set role to')
        .setRequired(true))
        .addRoleOption(option =>
			option
				.setName('role')
				.setDescription('The role to set user to')
                .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        if (!role) {
            await interaction.reply('The role does not exist.');
        } else if (!user) {
            await interaction.reply('The member does not exist.');
        } else {
            await user.roles.add(role);
            await interaction.reply(`${user} has been assigned ${role}`);
        }
       
       
    }
};