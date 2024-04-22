// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const { token, channelId } = require('./config.json');

const { updateLocalTaskLists, getLocalTaskLists } = require('./helperFunctions/retrieve_task_lists');
const { fetchSheetTitles } = require('./helperFunctions/google_sheet_helpers');
// Create a new client instance
const client = new Client({
	intents:
		[	GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages ]
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// stores a copy of task lists locally
updateLocalTaskLists();

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

// ping role when meeting starts
client.on('messageCreate', async (message) => {
	// if a message is coming from google cal webhook
	if (message.author.id === "1221908136554659900") {
		try {
			// get the role name from the message param
			let roleName = message.embeds[0].data.fields[2].value;
			// get the role id from the server roles list
			let roleId;
			message.guild.roles.cache.forEach(role => {
				if (role.name == roleName) {
					roleId = role.id;
				}
			});
			// if no role id found
			if (!roleId) {
				// reply w error msg
				await message.reply("Role could not be found")
			} else {
				// else, ping the role
				await message.reply(`<@&${roleId}>`);
			}
		} catch (error) {
			console.error(error);
			await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	
	}
})

//event listener
client.on(Events.InteractionCreate, async interaction => {

	if (!interaction.isChatInputCommand()) return;
	
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
	
	if (interaction.isAutocomplete() && interaction.commandName === 'createtask') {
		const focusedOption = interaction.options.getFocused(true);
	
		if (focusedOption.name === 'tasklistname') {
			const localTaskLists = await getLocalTaskLists()
			let filteredTaskLists = localTaskLists.filter(tasklist => 
				tasklist.name.toLowerCase().includes(focusedOption.value.toLowerCase())
			);

			// sort tasklist options alphabetically
			filteredTaskLists = filteredTaskLists.sort((a, b) => {
				return a.name.localeCompare(b.name);
			});
	
			await interaction.respond(
				// max autocomplete options supported by discord is 25
				filteredTaskLists.slice(0, 25).map(tasklist => ({ name: tasklist.name, value: tasklist.name }))
			);
		}
	}
	else if (interaction.isAutocomplete() && (interaction.commandName === 'addworkorder' || interaction.commandName === 'sendworkorder' || interaction.commandName === 'viewworkorder')){
        const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'title' || focusedOption.name === 'title2' || focusedOption.name === 'title3' || focusedOption.name === 'title4' || focusedOption.name === 'title5') {
			const titles = await fetchSheetTitles(); // Fetches titles of the Google Sheets in the Work Order folder
			let filteredTitles = titles.filter(title => 
                title.toLowerCase().includes(focusedOption.value.toLowerCase())
			);
		

			filteredTitles = filteredTitles.sort((a, b) => {
				return a.localeCompare(b);
			});

			// Respond with up to 25 choices that match the user's input
			await interaction.respond(
				filteredTitles.slice(0, 25).map(title => ({ name: title, value: title }))
			);
		}
	}
});

// Log in to Discord with your client's token
client.login(token);