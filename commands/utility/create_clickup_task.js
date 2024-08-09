const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { clickupToken } = require('../../config.json');
const { getLocalTaskLists } = require('../../helperFunctions/retrieve_task_lists');


module.exports = {
    data: new SlashCommandBuilder()
		// Define the parameters for the /createtask command
		// /createtask <tasklistname> <taskname> <description: optional> <due date: optional>
        // required params
        .setName('createclickuptask')
        .setDescription('Creates tasks and adds them to a task list for a specific ClickUp space')
        .addStringOption(option => 
            option.setName('tasklistname')
                .setDescription('The name of the list to add the task to')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option => 
            option.setName('taskname')
                .setDescription('The name of the task that you want to create')
                .setRequired(true))
        // optional paramas
		.addStringOption(option => 
			option.setName('description')
				.setDescription('Description of the task')
				.setRequired(false))
		.addStringOption(option => 
			option.setName('duedate')
				.setDescription('Due date of the task in yyyy-mm-dd format')
				.setRequired(false)),

    async execute(interaction) {
        // extends time to wait for a response from 3 sec to 15 mins
        await interaction.deferReply();

		// once the command is executed we extract the inputted params
        const taskListName = interaction.options.getString('tasklistname');
        const taskName = interaction.options.getString('taskname');
		const description = interaction.options.getString('description');
		const dueDateString = interaction.options.getString('duedate');

        // check if due date format is valid (yyyy-mm-dd)
		const validationResult = validateDueDate(dueDateString);
        if (validationResult.error) {
            await interaction.editReply(validationResult.error);
            return;
        }


        try {
            // find tasklist id based on tasklist name from all tasklists
            const taskListId = await findTaskIdByName(taskListName);
            if (!taskListId) {
                await interaction.editReply(`Could not find task list with name: ${taskListName}`);
                return;
            }
            // discord bot response
            const response = await createClickUpTask(taskListId, taskName, description, validationResult.timestamp);
            if (response.status === 200) {
                await interaction.editReply(`Successfully created Task: ${taskName}`);
            } else {
                await interaction.editReply('Failed to create task. Please check task list name and your ClickUp configuration.');
            }
        } catch (error) {
            // console.error('Error in creating ClickUp task:', error);
            await interaction.editReply('An error occurred while creating the task.');
        }
    },
};


async function findTaskIdByName(taskListName) {
    try {
        const allLists = await getLocalTaskLists(); // retrive all lists within the electrium clickup
        // Find a list that matches the taskListName
        const matchingList = allLists.find(list => list.name.toLowerCase() === taskListName.toLowerCase());
        return matchingList ? matchingList.id : null;
    } catch (error) {
        // console.error(`Error finding task list by name: ${taskListName}`, error);
        throw error;
    }
}

// function to send a post request to clickup api to create task
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

// throws error if date isn't in yyyy-mm-dd format or its in the past
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

        return { timestamp: dueDate.getTime() }; // unix timestamp in milliseconds
    }

    return { timestamp: null };
}

