const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const { YouTubeExtractor } = require("@discord-player/extractor")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song.')
        .addStringOption(option => 
            option
            .setName('song')
            .setDescription('Name of song you want to play.')
            .setRequired(true)
        ),
	async execute(interaction) {
        const player = useMainPlayer();
        await player.extractors.register(YouTubeExtractor);

        await interaction.deferReply();

		if (!interaction.member.voice.channel) {
            await interaction.editReply("❌ You must be in a voice channel to use this command.");
            return;
        }
        const queue = player.nodes.create(interaction.guild);

        if (!queue.connection) {
            await queue.connect(interaction.member.voice.channel)
        }

        let embed = new EmbedBuilder();
        let url = interaction.options.getString("song");

        const result = await player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO,
        });

        if (result.tracks.length === 0) {
            await interaction.editReply("No songs found.");
            return;
        }

        const entry = queue.tasksQueue.acquire();
        await entry.getTask();

        const song = result.tracks[0];
        queue.addTrack(song);

        embed 
            .setDescription(`**[${song.title}](${song.url})** 
            \`[0:00 / ${song.duration}]\` 
            
            Requested by: <@${interaction.user.id}>`)
            .setThumbnail(song.thumbnail)
       
        try {
            if(queue.isPlaying()) {
                embed
                    .setTitle("Queued")
            }
            else {
                embed
                    .setTitle("Now Playing  🎶")
                    .setColor(0x0099FF)
                
                await queue.node.play();
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            queue.tasksQueue.release();
        }

        await interaction.editReply({embeds: [embed]});
	}
};

