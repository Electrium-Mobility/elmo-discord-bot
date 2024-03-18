// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('createcategoryandchannel') // Command name matching file name
        .setDescription('Creates a new category and a text channel within it')
        // Text channel name
        .addStringOption((option) =>
            option.setName('categoryname')
                .setDescription('The name of the new category')
                .setMinLength(1)
                .setMaxLength(25) // Max length for category names
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('channelname') // option names need to always be lowercase and have no spaces
                .setDescription('Choose the name to give to the channel')
                .setMinLength(1) // A text channel needs to be named
                .setMaxLength(25) // Discord will cut-off names past the 25 characters,
                // so that's a good hard limit to set.
                .setRequired(true)
        )
        // You will usually only want users that can create new channels to
        // be able to use this command and this is what this line does.
        // Feel free to remove it if you want to allow any users to
        // create new channels
        // NOTE: WE MUST GRANT THE BOT THE NECESSARY PERMISSIONS TO CREATE CHANNELS
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        // It's impossible to create normal text channels inside DMs so disable the following field
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.reply({
            content: 'Creating category and channel...',
        });

        const guild = interaction.guild; // Getting the guild from the interaction
        const categoryName = interaction.options.getString('categoryname');
        const channelName = interaction.options.getString('channelname');
        const description = interaction.options.getString('description'); // description of the channel

        try {
            // create a category first
            const category = await guild.channels.create( {
                name: categoryName,
                type: ChannelType.GuildCategory,
            });

                await guild.channels.create( {
                    name: channelName, // Channel name
                    type: ChannelType.GuildText, // Corrected type value
                    parent: category.id, // Parent category ID
                    topic: description, // Channel topic (description)
                });

                // Inform the user of success
            await interaction.editReply({
                content: `The category "${categoryName}" and the channel "${channelName}" have been created successfully.`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: 'Failed to create the category and channel. Please check the bot\'s permissions and try again.',
            });
        }
    }
};
