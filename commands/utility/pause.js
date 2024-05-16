const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("pause")
        .setDescription("Pauses the current song."),
    async execute(interaction) {

        const queue = useQueue(interaction.guildId);
        const currentSong = queue.currentTrack;

        if (!queue) {
            await interaction.reply("❌ There is no song playing.");
            return;
        }

        queue.node.setPaused(true);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Paused  ⏸️")
                    .setDescription(`**${currentSong.title}**`)
            ]
        })
    }
}