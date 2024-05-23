const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("remove")
        .setDescription("Removes a song by queue position.")
        .addIntegerOption(option => 
            option
            .setName('track')
            .setDescription('Queue position.')
            .setRequired(true)
        ),
    async execute(interaction) {
        const queue = useQueue(interaction.guildId);
        let trackNumber = interaction.options.getInteger("track");

        if (trackNumber <= 0 || trackNumber > queue.size) {
            await interaction.reply("❌ Invalid track number. Use /queue to see list of songs.")
            return;
        }
        const song = queue.tracks.toArray().at(trackNumber-1);

        queue.removeTrack(trackNumber-1);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Removed")
                    .setDescription(`**${song.title}**`)
            ]
        })
    }
};