const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const { token, channelId } = require('../config.json');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
client.login(token);

const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { //used for testing if the server is running
	res.send({ msg: "server is running" });
});

//TO DO: put this in another file, and add more feature instead of only listen for pushes.
app.post('/api/github-webhook', (req, res) => {
	const payload = req.body;
	if (!payload.pusher) { //Only triggers when a cimmit is pushed
		res.status(200); 
		return;
	}

	const pusher = payload.pusher.name;
	const repoName = payload.repository.name;
	const commitMsg = payload.head_commit.message;
	const commitUrl = payload.head_commit.url;

	const discordMessage = `${pusher} has pushed to ${repoName} with commit: ${commitMsg}, ${commitUrl}`;

	const channel = client.channels.cache.get(channelId);
	if (channel) {
		channel.send(discordMessage);
	} else {
		console.log('Channel not found');
	}

	res.status(200).send({ msg: "webhook received" })
})

app.listen(port, () => {
	console.log(`Sever is listening at Port ${port}`);
});
