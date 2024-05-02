const { SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
const { getRows, addUser } = require('../../helperFunctions/google_sheet_helpers.js');

const prompts = [
  'What\'s your full name? (example Sherwin Chiu)',
  'What\'s your uWaterloo email? (example s36chiu@uwaterloo.ca)',
  'What\'s your role? (example Electrical, Firmware, Mechanical)' ,
  'What project are you working on? (example Bakfiets, Scooter, Vroom)',
  'What program are you in? (example Computer Engineering, Mechantronics Engineering)',
  'What year are you in? (example 1B, 2B, 3A)',
  'Are you Remote or In-person? (type Remote or In-person)',
  'You have been successfully added as an Electrium Member! Welcome to the team :)'
]
var answers = ["", "", "", "", "", "", ""]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createuser')
    .setDescription('Create a user on Google Sheets!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we wish to get info on')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const username = await user.username;

    let rows = await getRows();
    let data = rows.data.values.find(row => row[4] === username);

    // if user can be found
    if (data) {
      await interaction.reply({
        embeds: [{
           description: `This member is already on the Electrium Member List!`,
        }],
        ephemeral: true
     });
    } else {
      await interaction.reply({
        embeds: [{
           description: `Starting Interactive User Session. User is in creation menu.`,
        }],
        ephemeral: true
     });
      
      ephemeral: true
      const channel = interaction.channel;
      const threadManager = channel.threads;
      const thread = await threadManager.create({
        name: 'New User Creation for ' + username,
        autoArchiveDuration: 60, // Optional: Auto-archive after 60 minutes
        delete: 30,
        type: ChannelType.PrivateThread,
        //memberIds: [interaction.user.id, user.id], // Add the user who triggered the command
      });
      await thread.members.add(interaction.user.id)
      await thread.members.add(user.id)
      
      await thread.send("Please send messages slowly! :)")
      await thread.send(prompts[0])
      var response = (await thread.messages.fetch()).first().content;
      // look. i know its stupid. but it works. please let me have this lmao
      for (let i = 0; i < answers.length; i++){
        response = (await thread.messages.fetch()).first().content;
        setTimeout(() => {
        }, 1000);
        
        while (response.includes(prompts[i])){
          response = (await thread.messages.fetch()).first().content;
        }
        await thread.send(prompts[i+1])
        answers[i] = response
        setTimeout(() => {
        }, 1000);
      }
      console.log(answers);
      addUser(username, answers);

      await thread.delete()
      await user.send("Success! You've been added as an Electrium Member. Ask Sherwin for any questions you have!")

    }
	},
};