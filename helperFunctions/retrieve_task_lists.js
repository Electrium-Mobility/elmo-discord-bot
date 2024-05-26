const { clickupToken, clickupTeamId } = require('../config.json');
const axios = require('axios');

let localTaskLists = []; // locally stores tasklist array

// function called to update localTaskList array
async function updateLocalTaskLists() {
	try {
		localTaskLists = await getAllTaskLists();
		console.log("Local task lists updated succesfully");
	} catch (error){
		// console.error('Failed to update local task lists', error);
	}
}

// getter function for localTaskLists
async function getLocalTaskLists() {
    return localTaskLists;
}

// function that returns all tasks found in the discord team
async function getAllTaskLists() {
    const spaces = await getSpaces();
    let allLists = [];

    for (const space of spaces) {
        // retrieves folderless lists
        const folderlessLists = await getFolderlessLists(space.id);
        allLists = allLists.concat(folderlessLists);

        // retrieves all folders
        const folders = await getFolders(space.id);
        for (const folder of folders) {
            // retrives all tasklists nested within the folders
            const lists = await getLists(folder.id);
            allLists = allLists.concat(lists);
        }
    }
    return allLists;
}

// returns all the spaces in the electrium team clickup
async function getSpaces() {
    const url = `https://api.clickup.com/api/v2/team/${clickupTeamId}/space`;
    const config = {
        headers: {
            'Authorization': clickupToken 
        }
    };
    try {
        const response = await axios.get(url, config);
        return response.data.spaces;
    } catch (error) {
        // console.error('Error fetching spaces from ClickUp:', error);
        throw error;
    }
}

async function getFolderlessLists(spaceId) {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/list`;
    const config = {
        headers: { 'Authorization': clickupToken }
    };

    try {
        const response = await axios.get(url, config);
        return response.data.lists;
    } catch (error) {
        // console.error(`Error in getFolderlessLists for space ID ${spaceId}:`, error);
        throw error;
    }
}

async function getFolders(spaceId) {
    const url = `https://api.clickup.com/api/v2/space/${spaceId}/folder`;
    const config = {
        headers: { 'Authorization': clickupToken }
    };

    try {
        const response = await axios.get(url, config);
        return response.data.folders;
    } catch (error) {
        // console.error('Error fetching folders from ClickUp:', error);
        throw error;
    }
}

async function getLists(folderId) {
    const url = `https://api.clickup.com/api/v2/folder/${folderId}/list`;
    const config = {
        headers: { 'Authorization': clickupToken }
    };

    try {
        const response = await axios.get(url, config);
        return response.data.lists;
    } catch (error) {
        // console.error('Error fetching lists from ClickUp:', error);
        throw error;
    }
}

module.exports = { updateLocalTaskLists, getLocalTaskLists };