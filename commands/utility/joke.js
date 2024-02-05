const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const options = {
    method: 'GET',
    url: 'https://icanhazdadjoke.com/',
    headers: {
      'Accept': 'application/json'
    }
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('joke')
		.setDescription('pulls random dad jokes.'),
	async execute(interaction) {
    try {
      const response = await axios.request(options);
      await interaction.reply(response.data.joke);
    } catch (error) {
      console.error(error);
    }
	},
};