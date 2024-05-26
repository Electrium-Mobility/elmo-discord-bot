const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, ChannelType} = require('discord.js');
const { getRows, addUser } = require('../../helperFunctions/google_sheet_helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('adduser')
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
      // open a thread
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


      var answers = ["", "", "", "", "", "", ""]



      /* ----------------------------------
      BUILD SELECT MENUS + BUTTON SELECTS
      ------------------------------------ */


      // build select menus
      const roleSelect = new StringSelectMenuBuilder()
        .setCustomId('role')
        .setPlaceholder('Select your role!')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Firmware')
            .setValue('Firmware'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Electrical')
            .setValue('Electrical'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Mechanical')
            .setValue('Mechanical'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Webdev')
            .setValue('Webdev'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Finance')
            .setValue('Finance'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Marketing')
            .setValue('Marketing'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Management')
            .setValue('Management'),
        );

      const projectSelect = new StringSelectMenuBuilder()
        .setCustomId('project')
        .setPlaceholder('Select your project!')
        .addOptions(
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('OneWheel S24')
          //   .setValue('OneWheel S24'),
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('OneWheel W24')
          //   .setValue('OneWheel W24'),
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('Skateboard W24')
          //   .setValue('Skateboard W24'),
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('CF Skateboard')
          //   .setValue('CF Skateboard'),
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('Bakfiets W24')
          //   .setValue('Bakfiets W24'),
          // new StringSelectMenuOptionBuilder()
          //   .setLabel('QuickMefs W24')
          //   .setValue('QuickMefs W24'),
          new StringSelectMenuOptionBuilder()
            .setLabel('GoKart')
            .setValue('GoKart'),
        );

      const yearSelect = new StringSelectMenuBuilder()
        .setCustomId('project')
        .setPlaceholder('Select your project!')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('1A')
            .setValue('1A'),
          new StringSelectMenuOptionBuilder()
            .setLabel('1B')
            .setValue('1B'),
      );
      




		const remoteButton = new ButtonBuilder()
			.setCustomId('remote')
			.setLabel('Remote')
			.setStyle(ButtonStyle.Primary);

		const inPersonButton = new ButtonBuilder()
			.setCustomId('inPerson')
			.setLabel('In-Person')
			.setStyle(ButtonStyle.Secondary);
      
      // build action rows
      const roleRow = new ActionRowBuilder()
        .addComponents(roleSelect);
      const projectRow = new ActionRowBuilder()
        .addComponents(projectSelect);
      const yearRow = new ActionRowBuilder()
        .addComponents(yearSelect);
      const locationRow = new ActionRowBuilder()
        .addComponents(remoteButton, inPersonButton);

      /* ----------------------------------- */

      const prompts = [
        'What\'s your full name? (example Sherwin Chiu)',
        'What\'s your uWaterloo email? (example s36chiu@uwaterloo.ca)',
        {
          content: 'What\'s your role?',
          components: [roleRow]
        },
        {
          content: 'Which project are you working on?',
          components: [projectRow]
        },
        'Which program are you in?',
        {
          content: 'What year are you in? (current or upcoming school term)',
          components: [yearRow]
        },
        {
          content: 'Are you remote or in-person?',
          components: [locationRow]
        },
        'You have been successfully added as an Electrium Member! Welcome to the team :)'
      ]
        
      await thread.send("Please send responses slowly! :)");

      for (let i = 0; i < answers.length; i++){

        // look. i know its stupid. but it works. please let me have this lmao
        // if the prompt is one of the open ended questions without options
        if (i === 0 || i === 1 || i === 4) {
          await thread.send(prompts[i]);
          var response = (await thread.messages.fetch()).first().content;
          setTimeout(() => {
          }, 1000);
          
          while (response.includes(prompts[i])){
            response = (await thread.messages.fetch()).first().content;
          }
          answers[i] = response;
        } else if (i === 6) {
          // button select

        } else {
          // string select from dropdown menu
          const response = await thread.send(prompts[i]);
          const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
          setTimeout(() => {
          }, 1000);
          collector.on('collect', async int => {
            const selection = int.values[0];
            answers[i] = selection;
          });
          setTimeout(() => {
          }, 1000);
        }
        setTimeout(() => {
        }, 1000);
      }
      // log user's response
      console.log(answers);
      addUser(username, answers);

      await thread.delete()
      await user.send("Success! You've been added as an Electrium Member. Ask Sherwin for any questions you have!")

    }
	},
};