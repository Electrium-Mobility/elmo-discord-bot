// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Create a new client instance
const client = new Client({ intents: 
	[GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", msg => {
	console.log(msg.content);
	if (msg.content === "ping") {
		msg.reply({ content: 'pong' })
	}
})

client.commands = new Collection();
//command handling, loading all command files and saving command paths in commandFiles 
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//event listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send({msg:"server is running"});
});

app.post('/', (req, res)=>{
//	console.log(req.body);
    const payload = req.body;
	console.log(payload);
	console.log(payload.pusher);
    if(!payload.pusher){
	    res.status(200);
	    return;
	}
		
    const pusher = payload.pusher.name;
    const repoName = payload.repository.name;
    const commitMsg = payload.head_commit.message;
    const commitUrl = payload.head_commit.url;

    const discordMessage = `${pusher} has pushed to ${repoName} with commit: ${commitMsg}, ${commitUrl}`;

    const channel = client.channels.cache.get("1199133159439224895");
    if (channel) {
        channel.send(discordMessage);
    } else {
        console.log('Channel not found');
    }	

	res.status(200).send({msg:"webhook received"})
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


