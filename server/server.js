const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const { token, channelId } = require('../config.json');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]});
client.login(token);

const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { //used for testing if the server is running
	res.send({ msg: "server is running" });
});
//TODO: put this in another file if more endpoints are required.
app.post('/api/github-webhook', (req, res) => {
    const payload = req.body;
    let discordMessage = '';

    // Handle push event
    if (payload.pusher) {
        const pusher = payload.pusher.name;
        const repoName = payload.repository.name;
        const commitMsg = payload.head_commit.message;
        const commitUrl = payload.head_commit.url;

        discordMessage = `${pusher} has pushed to ${repoName} with commit: ${commitMsg}, ${commitUrl}`;
    }
    // Handle pull request event
    else if (payload.pull_request && payload.action === 'opened') {
        const pullRequestUser = payload.pull_request.user.login;
        const repoName = payload.repository.name;
        const pullRequestTitle = payload.pull_request.title;
        const pullRequestUrl = payload.pull_request.html_url;

        discordMessage = `${pullRequestUser} has submitted a pull request in ${repoName}: ${pullRequestTitle}, ${pullRequestUrl}`;
    }

    // If an event is recognized and a message is formed
    if (discordMessage) {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send(discordMessage);
        } else {
            console.log('Channel not found');
        }
    } else {
        console.log('Unrecognized event type');
    }

    res.status(200).send({ msg: "Webhook received" });
});


app.listen(port, () => {
	console.log(`Sever is listening at Port ${port}`);
});
