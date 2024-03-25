const {SlashCommandBuilder, ChannelType, PermissionFlagsBits} = require("discord.js");

//move channel to archiveCategory
const archive = async (interaction, channel, archiveCategory) => {
    if (channel.type == ChannelType.GuildCategory) { //if selected channel is a category, move its contents, then delete the category
        console.log(channel.id);
        const children = interaction.guild.channels.cache.filter(c => c.parentId === channel.id);
        console.log(children);
        const setParent = async (child) => {
            await child.setParent(archiveCategory);
        }
        setParentPromises = children.map((c)=> setParent(c));
        await Promise.all(setParentPromises);
        await channel.delete();
    } else {
        await channel.setParent(archiveCategory);
    }
}
    

module.exports = {
    data: new SlashCommandBuilder()
        .setName("archiveprojects")
        .setDescription("Archive complete projects at end of term. Options take channels or categories interchangeably.")
        .addStringOption((option) =>
            option
                .setName("term")
                .setDescription("term just completed, eg: 'F23'")
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Single channel/category to archive")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("channels-list")
                .setDescription("List of channels/categories to archive, separated by commas")
                .setRequired(false)
        ),
        
    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply("You do not have permission to run this command");
            }
        } catch (err) {
            throw err;
        }

        await interaction.reply("Archiving old term projects...");
        const channel = interaction.options.getChannel("channel");
        const channelsList = interaction.options.getString("channels-list");
        const term = interaction.options.getString("term");
        let archiveCategory;
        try {
            archiveCategory = interaction.guild.channels.cache.find(channel => channel.name.toLowerCase() === (term + " Archive").toLowerCase());
            // if no archiveCategory exists to archive the selected term, create one
            if (!archiveCategory) {
                archiveCategory = await interaction.guild.channels.create({
                    name: term + " Archive",
                    type: ChannelType.GuildCategory
                });            
            }
        } catch (err) {
            await interaction.editReply("Could not create archive category for specified term");
            return;
        }

        try {
            if (channel) {
                await archive(interaction, channel, archiveCategory)
            }
        } catch (err) {
            await interaction.editReply(
                "Could not archive channel. \nNOTE: If you want to archive multiple channels/categories, use the channels-list option instead");
            return;
        }

        try {
            if (channelsList) {
            const channelNames = channelsList.split(",");
            console.log(channelNames);
            const channels = channelNames.map(name => interaction.guild.channels.cache.find(channel => channel.name.toLowerCase() === name.toLowerCase()));
            console.log(channels);
            const channelPromises = channels.map(channel => {
                if (channel) {
                    return archive(interaction, channel, archiveCategory)}
                });
            await Promise.all(channelPromises);
            }
        } catch (err) {
            await interaction.editReply(
                "Could not archive channels-list. Make sure you listed the channels separated by commas, with no spaces. \nNOTE: If you want to archive just one channel/category, try using the channel option instead");
                console.error(err);
            return;
        }

        await interaction.editReply("Term projects archived!");
    },
};
