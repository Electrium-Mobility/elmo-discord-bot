const { SlashCommandBuilder} = require('discord.js');
const { getSheetIdByTitle } = require('../../helperFunctions/google_sheet_helpers');

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const TOKEN_PATH = './tokens.json'; /* Locaiton of the OAuth2.0 Token for the automated emailing */ 
const REDIRECT_URL = 'http://localhost:3000/oauth2callback'; /* Page that user will be redirected to after authenticating gmail api */

/* EMAIL PARAMETERS - FEEL FREE TO CHANGE FOR YOUR SPECIFIC EMAIL NEEDS */
const EMAIL_DEST = 'georgeli293@gmail.com'; /* Dest of the email E.g georgeli293@gmail.com  CHANGE LATER PLZ DONT SPAM MY EMAIL */
const EMAIL_SUBJECT = 'Electrium Mobility - Workorder - Team Funds';
const EMAIL_BODY = 'Hi Sarah,\n\n Please see the attached work orders \n\n Thanks\n Julian Choi';


module.exports = {
	data: new SlashCommandBuilder()
		.setName('viewworkorder')
        .setDescription('Returns the links to the google sheets with the provided titles')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Title of the Google sheet we want to send')
                .setAutocomplete(true)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title2')
                .setDescription('Additional Google sheet that we want to send')
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('title3')
                .setDescription('Additional Google sheet that we want to send')
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('title4')
                .setDescription('Additional Google sheet that we want to send')
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('title5')
                .setDescription('Additional Google sheet that we want to send')
                .setAutocomplete(true)),

    
    async execute(interaction){
        const title = interaction.options.getString('title');
        const titles = [];
        titles.push(title) /* Add the first spreadsheet */  

        // We check to see if there are other spreadsheets attached
        for (let i = 2; i <= 5; i++) {
            const other_title = interaction.options.getString(`title${i}`);
            if (other_title) {
                titles.push(other_title);
            }
        }
        let responseText = 'Spreadsheet Links:\n';
        for (const title of titles) {
            const sheetId = await getSheetIdByTitle(title);
            if (sheetId) {
                const link = `https://docs.google.com/spreadsheets/d/${sheetId}`;
                responseText += `${title}: ${link}\n`;
            } else {
                responseText += `${title}: Not found.\n`;
            }
        }

        // Ensures the user doesn't attach duplicate spreadsheets
        const uniqueTitles = new Set(titles);
        if (uniqueTitles.size < titles.length) {
            await interaction.reply("You've entered duplicate titles. Please ensure each title is unique.");
            return;
        }

        await interaction.reply(responseText);
    }
};