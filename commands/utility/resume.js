const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("resume")
        .setDescription("Resumes the current song."),
    async execute(interaction) {

        const queue = useQueue(interaction.guildId);
        const currentSong = queue.currentTrack;

        if (!queue) {
            await interaction.reply("❌ No songs are playing.");
            return;
        }

        queue.node.setPaused(false);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Resumed  ▶️")
                    .setDescription(`**${currentSong.title}**`)
            ]
        })
    }
}