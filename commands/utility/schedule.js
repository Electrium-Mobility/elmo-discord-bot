const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
/*  ----------------------
Google Calendar API Setup
-------------------------- */
const {authenticate} = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/calendar.readonly"
})
const calendarClient = auth.getClient();
const calendar = google.calendar({ version: "v3", auth });
const calendarId = "c2e4ddc715d346cd957fadf163edcded4b957fcb6381d5e4b5f503c660689de5@group.calendar.google.com";
/* ------------------- */

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
    .setDescription('Display upcoming meetings and workshops!')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we wish to get info on')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const username = await user.username;

    const res = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
      await interaction.reply('No upcoming events found.');
    }
    else {
      let eventList = "Upcoming 5 events: \n";
      events.map((event, i) => {
        let startDate = event.start.dateTime;
        startDate = Date.parse(startDate);
        startDateParsed = new Date(startDate);
        const day = startDateParsed.getDate();
        const month = startDateParsed.getMonth();
        const hour = startDateParsed.getUTCHours();
        const min = startDateParsed.getUTCMinutes();
        eventList = eventList.concat(`${month} / ${day} at ${hour}:${min} - ${event.summary} \n`);
      });
      await interaction.reply(eventList);
    }
	},
};