const {exec} = require('child_process');
const { SlashCommandBuilder } = require('discord.js');
const { google } = require("googleapis");
const fs = require('fs');
const csvWriter = require('csv-write-stream');

// const MEMBERS_SPREADSHEET_ID = "16jdx-mM-1kQxB2cNLaTvRDDXp82hHqTXaQSiFIuTH2s";
const MEMBERS_SPREADSHEET_ID = "1UjimZ-KxA4btgbWzBZ_dxB5WrPgAdrYHKuT2bEkHftk";
const RANGE = "Sheet3!A:E";
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });

async function updateCSV(){ //gets member's info from spreadsheet
    const response = await googleSheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: MEMBERS_SPREADSHEET_ID,
        range: RANGE,
      });
    const data = response.data.values;
    // console.log(data);
    const filtered_data = data.map(row => [row[0], row[1], row[3], row[4]]);
    const writer = csvWriter();
    writer.pipe(fs.createWriteStream('./helperFunctions/email/emailList.csv'));
    fs.truncateSync('./helperFunctions/email/emailList.csv');
    for(let i = 1; i < filtered_data.length; i++){
        let row = filtered_data[i];
        if(row[0] !== ''){
            writer.write({Email: row[0], Name: row[1], Team: row[2], Accepted: row[3]});
        }
        
    }
    writer.end();
    setTimeout(()=>{},3000);
    return;

}


function sendEmails(){
    exec('python ./helperFunctions/email/email_results.py', (error, stdout) => {
        if (error) {
            console.error(`Error executing Python script: ${error}`);
            return;
        }
        console.log(`Python script output: ${stdout}`);
    });
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('send_emails')
		.setDescription('sends acceptance email to members'),
	async execute(interaction) {
        updateCSV(); // rethink the order bc token keeps expiring?
        //run updateCSV() to get list of emails
        sendEmails(); 
        await interaction.reply({ content: `Sent emails!`, ephemeral: true });
    }
}

