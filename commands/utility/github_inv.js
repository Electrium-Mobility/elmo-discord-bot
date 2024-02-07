const { SlashCommandBuilder } = require('discord.js');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});
  

module.exports = {
	data: new SlashCommandBuilder()
		.setName('git_inv')
		.setDescription('sends a github invitation')
		.addStringOption(option =>
			option
				.setName('email')
				.setDescription('members email')
				.setRequired(true)),
	async execute(interaction) {

		const email = interaction.options.getString('email');

		try{
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
			await interaction.reply("Invitation Sent!");
		}catch(error){
			await interaction.reply({content: "Invitation failed, please double check the email and try again...", ephemeral : true});
		}

	},
};