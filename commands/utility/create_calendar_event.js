const { SlashCommandBuilder } = require('discord.js');
const { createEvent } = require('../../helperFunctions/google_API_helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_calendar_event')
		.setDescription('Create a Google calendar event')
		.addStringOption(option => 
            option.setName('eventname')
                .setDescription('The name of the calendar event')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('date')
                .setDescription('The date of the event in [yyyy-mm-dd] format')
                .setRequired(true))
		.addStringOption(option => 
			option.setName('starttime')
				.setDescription('Start time in [hh:mm:ss-05:00] format')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('endtime')
				.setDescription('End time in [hh:mm:ss-05:00] format')
				.setRequired(true))
		// optional - description
		.addStringOption(option => 
			option.setName('description')
				.setDescription('Description of event')
				.setRequired(false)),

    async execute(interaction) {

        const eventName = interaction.options.getString('eventname');
        const date = interaction.options.getString('date');
		const startTime = interaction.options.getString('starttime');
		const endTime = interaction.options.getString('endtime');
		const desc = interaction.options.getString('description');

		const event = {
			'summary': eventName,
			'description': desc,
			'start': {
			'dateTime': date + 'T' + startTime,
			'timeZone': 'Canada/Eastern',
			},
			'end': {
				'dateTime': date + 'T' + endTime,
				'timeZone': 'Canada/Eastern',
			},
		};

		const response = await createEvent(event);
		if (response.status === 200) {
			await interaction.editReply(`Successfully created event: ${eventName}`);
		} 
		else {
			await interaction.editReply('Failed to create event.');
		}	
	},
};