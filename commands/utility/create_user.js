const { SlashCommandBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');

// const client = new Client();
/*  ----------------------
Google Sheets Setup
-------------------------- */
const { spreadsheetId } = require('../../config.json');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });
/* ------------------- */

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

    // get Google sheet columns A to G
    const rows = await googleSheets.spreadsheets.values.get({
			auth: auth,
			spreadsheetId: spreadsheetId,
			range: "A:G"
    });

    // find user
    const data = rows.data.values.find(row => row[4] === username);
    // find last row
    const lastRow = rows.data.values.length;
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
      console.log(answers)

      googleSheets.spreadsheets.values.append({
        auth: auth,
        spreadsheetId: spreadsheetId,
        range: "A:G",
        valueInputOption: "USER_ENTERED",
        resource: {
          majorDimension: "ROWS",
          values: [[lastRow, answers[0], "", answers[1], username, answers[2], answers[3], "", answers[4], answers[5], answers[6]]]
        } 
      })
      await thread.delete()
      await user.send("Success! You've been added as an Electrium Member. Ask Sherwin for any questions you have!")

    }
	},
};
// so two approaches we can go for:
// command interaction, where /createuser (type discord) (name) (email) (uwaterloo email) (all this other stuff)
// or we can have /createuser (type discord) and it DMs and collects that information
// so it'll be like a form
// i kinda like the second one