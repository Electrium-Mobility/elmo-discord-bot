// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvoicechannelincategory') // Command name matching file name
        .setDescription('Creates a new voice channel within the current category')
        // Text channel name
        .addStringOption((option) =>
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
            content: 'Fetched all input and working on your request!',
        });

        const guild = interaction.guild; // Getting the guild from the interaction
        const chosenChannelName = interaction.options.getString('channelname');
        // get channel name from the user input


        const currentCategoryID = interaction.channel.parentId;// get the parent category of the channel where the command was used
        // so we can create the new channel inside the same category
        const description = interaction.options.getString('description'); // description of the channel

        try {

            // Ensure we are in a guild and the command was issued from a channel that can have a parent
            // if we just want to create a plain channel with no parent category, then we use a different command
            if (!guild || !currentCategoryID) {
                await interaction.editReply({
                    content: 'This command can only be used within a server channel that has a category.',
                });
                return;
            }

            // Check if a channel with the chosen name already exists in the category
            const channelExists = guild.channels.cache.some(channel =>
                channel.name === chosenChannelName &&
                channel.parentId === currentCategoryID &&
                channel.type === ChannelType.GuildVoice
            );

            if (!channelExists) {
                await guild.channels.create( {
                    name: chosenChannelName, // Channel name
                    type: ChannelType.GuildVoice, // Corrected type value
                    parent: currentCategoryID, // Parent category ID
                    topic: description, // Channel topic (description)
                });

                // Inform the user of success
                await interaction.editReply({
                    content: `The channel ${chosenChannelName} has been created successfully!`,
                });
            } else {
                await interaction.editReply({
                    content: `A channel with the name ${chosenChannelName} already exists.`,
                });
            }
        } catch (error) {
            console.log(error);
            await interaction.editReply({
                content: 'Your channel could not be created! Please check if the bot has the necessary permissions!',
            });
        }
    }

};
