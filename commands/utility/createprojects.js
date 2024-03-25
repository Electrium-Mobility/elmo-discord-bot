const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

const setUpProject = async (interaction, projectName) => {
    try {
        const projectRole = await interaction.guild.roles.create({
            name: projectName,
        })

        //grant view perms to any user with admin perms
        const adminRoles = interaction.guild.roles.cache.filter(role => role.permissions.has(PermissionFlagsBits.Administrator));
        const adminViewPerms = adminRoles.map(role => {return {id: role.id, allow: [PermissionFlagsBits.ViewChannel]}});

        const projectCategory = await interaction.guild.channels.create({
            name: projectName,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: projectRole.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                },
                ...adminViewPerms
            ]
        });

        const gen = await interaction.guild.channels.create({
            name: projectName.replaceAll(" ", "-") + "-gen",
            type: ChannelType.GuildText
        });
        await gen.setParent(projectCategory);

        const mech = await interaction.guild.channels.create({
            name: projectName.replaceAll(" ", "-") + "-mech",
            type: ChannelType.GuildText
        });
        await mech.setParent(projectCategory);

        const electrical = await interaction.guild.channels.create({
            name: projectName.replaceAll(" ", "-") + "-electrical",
            type: ChannelType.GuildText
        });
        await electrical.setParent(projectCategory);

        const firmware = await interaction.guild.channels.create({
            name: projectName.replaceAll(" ", "-") + "-firmware",
            type: ChannelType.GuildText
        });
        await firmware.setParent(projectCategory);

        const voice = await interaction.guild.channels.create({
            name: projectName.replaceAll(" ", "-") + "-gen",
            type: ChannelType.GuildVoice
        });
        await voice.setParent(projectCategory);
    } catch (err) {
        throw err;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createprojects")
        .setDescription("Command to set up categories and channels for new term projects.")
        .addStringOption((option) =>
            option
                .setName("project-list")
                .setDescription("List of new project names, separated by commas")
                .setRequired(true)
        ),
        
    async execute(interaction) {
        await interaction.reply("Creating Project Categories...");
        const projectNames = interaction.options.getString("project-list").split(",");
        const projectPromises = projectNames.map(name => setUpProject(interaction, name));
        await Promise.all(projectPromises);
        await interaction.editReply("Project Categories Created!");
    }
}
