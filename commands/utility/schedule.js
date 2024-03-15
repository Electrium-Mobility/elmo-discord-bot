const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getEvents } = require('../../helperFunctions/google_sheet_helpers');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
    .setDescription('Display upcoming meetings and workshops!'),
  async execute(interaction) {
    // get user info
    const user = interaction.guild.members.cache.get(interaction.member.id)

    // get all roles in server
    let list = [];
    interaction.guild.roles.cache.forEach(role => list.push(role.name));
    // get array of user's roles
    let rolesList = await getRoles(user, list);

    const allEvents = await getEvents();
    let events = [];

    // sort through events and only get add the ones that are applicable by role
    for (let event of allEvents) {
      if (event.description) {
        let array = event.description.split('+');
        if (array.every(element => rolesList.includes(element))) {
          events.push(event);
        }
      }
    }

    if (events.length === 0) {
      await interaction.reply({ content: 'No upcoming events found.', ephemeral: true });
    }
    else {
      let eventList = "Upcoming events: \n";
      events.map((event, i) => {

        // get start date of event
        let startDate = event.start.dateTime;

        // format date output
        let date = startDate.split("2024-")[1].split("T")[0];
        let time = startDate.split("T")[1].split("-")[0];
        // remove seconds
        time = time.slice(0, -3);
        // AM or PM
        if (time.split(":")[0] > 12) {
          let hour = time.split(":")[0];
          let minutes = time.split(":")[1];
          hour = hour - 12;
          time = "";
          time = time.concat(hour, ":", minutes, " PM");
        } else {
          time = time.concat(" AM");
        }

        // timezone
        let zone = startDate.split("-")[3];
        if (zone == "05:00") time = time.concat(" EST");
        if (zone == "08:00") time = time.concat(" PST");

        // append event to list
        eventList = eventList.concat(`${date} at ${time} - ${event.summary} \n`);
      });

      // output list of events
      await interaction.reply({ content: eventList, ephemeral: true });
    }
	},
};

async function getRoles(user, rolesList) {
  let userRoles = [];

  for (roleName of rolesList) {
    if (user.roles.cache.some(role => role.name === roleName)) {
      userRoles.push(roleName);
    }
  }
  return userRoles;
}
