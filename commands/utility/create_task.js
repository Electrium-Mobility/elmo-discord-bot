const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { clickupToken, clickupTeamId } = require('../../config.json');


module.exports = {
    data: new SlashCommandBuilder()
		// Define the parameters for the /createtask command
		// /createtask <space> <tasklistname> <taskname> <description: optional> <due date: optional>
        .setName('createtask')
        .setDescription('Creates tasks and adds them to a task list for a specific ClickUp space')
		.addStringOption(option => 
			option.setName('space')
				.setDescription('The name of the ClickUp space that the task list belongs to (Software, Logistics, etc)')
				.setRequired(true))
        .addStringOption(option => 
            option.setName('tasklistname')
                .setDescription('The name of the list to add the task to')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('taskname')
                .setDescription('The name of the task that you want to create')
                .setRequired(true))
		.addStringOption(option => 
			option.setName('description')
				.setDescription('Description of the task')
				.setRequired(false))
		.addStringOption(option => 
			option.setName('duedate')
				.setDescription('Due date of the task in yyyy-mm-dd format')
				.setRequired(false)),

    async execute(interaction) {
		// once the command is executed we extract the inputted params
		const spaceName = interaction.options.getString('space');
        const taskListName = interaction.options.getString('tasklistname');
        const taskName = interaction.options.getString('taskname');
		const description = interaction.options.getString('description');
		const dueDateString = interaction.options.getString('duedate');

		const validationResult = validateDueDate(dueDateString);

        if (validationResult.error) {
            await interaction.reply(validationResult.error);
            return;
        }


        try {
			const spaceId = await findSpaceIdByName(spaceName);
			if (!spaceId) {
                await interaction.reply(`Could not find ClickUp space with name: ${taskListName}`);
                return;
            }
            const taskListId = await findTaskIdByName(taskListName, spaceId);
            if (!taskListId) {
                await interaction.reply(`Could not find task list with name: ${taskListName}`);
                return;
            }

            const response = await createClickUpTask(taskListId, taskName, description, validationResult.timestamp);
            if (response.status === 200) {
                await interaction.reply(`Successfully created Task: ${taskName}`);
            } else {
                await interaction.reply('Failed to create task. Please check task list name and your ClickUp configuration.');
            }
        } catch (error) {
            console.error('Error in creating ClickUp task:', error);
            await interaction.reply('An error occurred while creating the task.');
        }
    },
};

async function findSpaceIdByName(spaceName) {
    const url = `https://api.clickup.com/api/v2/team/${clickupTeamId}/space`;
    const config = {
        headers: {
            'Authorization': clickupToken
        }
    };

    try {
        const response = await axios.get(url, config);
        const spaces = response.data.spaces;
        const matchedSpace = spaces.find(space => space.name.toLowerCase() === spaceName.toLowerCase());
        return matchedSpace ? matchedSpace.id : null;
    } catch (error) {
        console.error('Error finding space ID:', error);
        return null;
    }
}

async function findTaskIdByName(taskListName, spaceId) {

    const url = `https://api.clickup.com/api/v2/space/${spaceId}/list`; 
    const config = {
        headers: {
            'Authorization': clickupToken 
        }
    };

    try {
        const response = await axios.get(url, config);
        const lists = response.data.lists;
        const matchedList = lists.find(list => list.name.toLowerCase() === taskListName.toLowerCase());
        return matchedList ? matchedList.id : null;
    } catch (error) {
        console.error('Error finding task list ID:', error);
        return null;
    }
}

async function createClickUpTask(taskListId, taskName, description, dueDateTimestamp) {
    const url = `https://api.clickup.com/api/v2/list/${taskListId}/task`; 
    const config = {
        headers: {
            'Authorization': clickupToken 
        }
    };
    const data = {
        name: taskName,
		description: description,
		due_date: dueDateTimestamp
    };

    return axios.post(url, data, config);
}

function validateDueDate(dueDateString) {
    if (dueDateString) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDateString)) {
            return { error: 'Invalid due date format. Please use yyyy-mm-dd format.' };
        }

        const dueDate = new Date(dueDateString + 'T00:00:00Z');
        if (isNaN(dueDate.getTime())) {
            return { error: 'Invalid due date. Please enter a valid date in yyyy-mm-dd format.' };
        }

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (dueDate < currentDate) {
            return { error: 'Invalid due date, the due date cannot be in the past.' };
        }

        return { timestamp: dueDate.getTime() }; // Unix timestamp in milliseconds
    }

    return { timestamp: null }; // No due date provided
}
