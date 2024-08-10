const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useQueue } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder() 
        .setName("queue")
        .setDescription("Shows the first 10 songs in the queue."),
    async execute(interaction) {

        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.isPlaying) {
            await interaction.reply("❌ No songs are playing.");
            return;
        }

        const queueString = queue.tracks.toArray().slice(0, 10).map((song, i) => {
            return `**${i+1}.** \`[${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`;
        }).join("\n");
        
        const currentSong = queue.currentTrack;

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing:**\n ${currentSong.title} - <@${currentSong.requestedBy.id}>\n\n**Queue:**\n${queueString}`)
            ]
        })
    }
}