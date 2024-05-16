const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("skip")
        .setDescription("Skips the current song."),
    async execute(interaction) {

        const queue = useQueue(interaction.guildId);

        if (!queue) {
            await interaction.reply("❌ No songs are playing.");
            return;
        }
        const currentSong = queue.currentTrack;

        queue.node.skip();

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Skipped ⏩")
                    .setDescription(`**${currentSong.title}**`)
            ]
        })
    }
}