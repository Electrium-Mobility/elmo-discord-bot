const { SlashCommandBuilder } = require('discord.js');
const { Octokit } = require("@octokit/rest");
  
module.exports = {
	data: new SlashCommandBuilder()
		.setName('git_inv')
		.setDescription('sends a github invitation')
		.addStringOption(option =>
			option
				.setName('email')
				.setDescription('members email')),
	async execute(interaction, token) {
		const octokit = new Octokit({
			auth: token
		});
		const email = interaction.options.getString('email');

		await octokit.request('POST /orgs/{org}/invitations', {
			org: 'testingforbot',
			email: email,
			role: 'direct_member',
			/*team_ids: [
			  12,
			  26
			],*/
			headers: {
			  'X-GitHub-Api-Version': '2022-11-28'
			}
		});

		await interaction.reply(`This command was run by ${interaction.user.username}, testing`);
	},
};