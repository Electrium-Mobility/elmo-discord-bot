const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const options = {
    method: 'GET',
    url: 'https://dad-jokes7.p.rapidapi.com/dad-jokes/joke-of-the-day',
    headers: {
      'X-RapidAPI-Key': '88756abc99msh32967fd78d46abap12dc08jsned44831eb8dc',
      'X-RapidAPI-Host': 'dad-jokes7.p.rapidapi.com'
    }
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('joke')
		.setDescription('pulls random dad jokes.'),
	async execute(interaction) {
    try {
      const response = await axios.request(options);
      console.log(response.data);
      await interaction.reply(response.data.joke);
    } catch (error) {
      console.error(error);
    }
	},
};