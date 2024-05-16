const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("exit")
        .setDescription("Exits the music player."),
    async execute(interaction) {

        const queue = useQueue(interaction.guildId);

        if (!queue) {
            await interaction.reply("❌ No songs are playing.");
            return;
        }

        queue.delete();

        await interaction.reply("✅ Stopped music playback and left voice channel.")
    }
}