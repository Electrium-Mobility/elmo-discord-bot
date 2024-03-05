const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Joins a voice channel.'),
	async execute(interaction) {
		try {
			// Create voice connection
			const voiceChannel = interaction.member.voice;
			const connection = joinVoiceChannel({
				channelId: voiceChannel.channel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			})
			const client = interaction.client;

			// Listening to VoiceStateUpdate event
			client.on('voiceStateUpdate', (oldState, newState) => {

                // Check if the bot is in a voice channel and there are no other users in the channel
                const botVoiceState = newState.guild.voiceStates.cache.get(client.user.id);
                const botChannel = botVoiceState.channel;
				if (botVoiceState && botChannel && botChannel.members.size === 1) {
                    // Disconnect the bot from the voice channel
                    if (connection) {
                        connection.disconnect();
                        console.log('Bot disconnected from voice channel');
                    }
                }
			});

			await interaction.reply('Connection successful!');
		}
		catch(error) {
			await interaction.reply('Connection unsuccessful.')
		}
        
	},
};

