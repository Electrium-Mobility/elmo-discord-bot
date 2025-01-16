const { SlashCommandBuilder, PermissionFlagsBits, Guild } = require('discord.js');
const { getRows } = require('../../helperFunctions/google_sheet_helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assignall')
        .setDescription('Assigns roles for users from spreadsheet')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const discordmembers = new Map();

        // Fetch all members in the server
        let discordmembers_get = await interaction.guild.members.list({ limit: 1000 });
        for (let x of discordmembers_get) {
            let username = x[1].user.username.toLowerCase();
            let id = x[1].user.id;
            discordmembers.set(username, id);
        }

        // Get rows from sheet
        let rows = await getRows();
        let entries = rows.data.values;

        // Iterate through sheet
        for (let data of entries) {
            let username = data[3]?.toLowerCase();
            let userID = discordmembers.get(username);

            // Array of roles to assign
            let rolesToAssign = [];
            if (data[5]) rolesToAssign.push(data[5]);
            if (data[6]) rolesToAssign.push(data[6]);

            if (userID) {
                for (let position of rolesToAssign) {
                    let roleName = position.toLowerCase().replace(/\s/g, "-");
                    let role = interaction.guild.roles.cache.find(role => role.name === roleName);

                    if (!role) {
                        console.error(`Role not found: ${roleName}`);
                        continue;
                    }

                    let roleId = role.id;

                    // Fetch the user object and assign role
                    await interaction.guild.members.fetch(userID)
                        .then(res => {
                            res.roles.add(roleId)
                                .then(() => console.log(`Role ${roleName} assigned to ${res.user.username}`))
                                .catch(err => console.error(`Failed to assign role ${roleName} to ${res.user.username}:`, err));
                        })
                        .catch(err => console.error(`Failed to fetch user ${username}:`, err));
                }
            } else {
                console.error(`User not found in Discord: ${data[2]} (email)`);
            }
        }

        await interaction.reply({ content: "Command has run successfully.", ephemeral: true });
    }
};
