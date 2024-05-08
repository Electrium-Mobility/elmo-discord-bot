const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getSheetIdByTitle } = require('../../helperFunctions/google_sheet_helpers');
const { gmail_id, gmail_secret_id } = require('../../config.json')

const { google } = require('googleapis');

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const TOKEN_PATH = './tokens.json'; /* Locaiton of the OAuth2.0 Token for the automated emailing */ 
const REDIRECT_URL = 'http://localhost:3000/oauth2callback'; /* Page that user will be redirected to after authenticating gmail api */
const FILLED_FORMS_FOLDER = "1cBG-BgIbqXxvfmdNcgmw5WRST8jWE2Pn";

/* EMAIL PARAMETERS - FEEL FREE TO CHANGE FOR YOUR SPECIFIC EMAIL NEEDS */
const EMAIL_DEST = 'nlchung@uwaterloo.ca';
const EMAIL_SUBJECT = 'Electrium Mobility - Workorder - Team Funds';
const EMAIL_BODY = 'Hi Sarah,\n\n Please see the attached work orders \n\n Thanks\n George Li';

/* ------------------- */
// Setup for Google sheets and drive
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
	scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ],
})

// OAuth2 Client Setup for Gmail
const oauth2Client = new google.auth.OAuth2(
    gmail_id,
    gmail_secret_id ,
    REDIRECT_URL
  );

/* ------------------- */

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sendworkorder')
        .setDescription('Sends an email of the workorder to Sarah')
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
                .setAutocomplete(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    
    async execute(interaction){
        await interaction.deferReply(); // Defer reply since command will take awhile
        
        /* Authentication for gmail api */
        const authenticatedClient = await authenticateOAuth2Client(oauth2Client);
        if (!authenticatedClient) {
            await interaction.editReply("Failed to authenticate for email sending.");
            return;
        }

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
        const filePaths = []; // Array containing all of the filepaths of the excel sheets we will email
        const spreadsheetIds = [];
        for (const title of titles) {
            const spreadsheetId = await getSheetIdByTitle(title);
            spreadsheetIds.push(spreadsheetId);
            if (!spreadsheetId) {
                await interaction.editReply(`Failed to find spreadsheet with title: ${title}`);
                return;
            }
            const filePath = await exportSpreadsheetAsExcel(spreadsheetId, title);
            filePaths.push(filePath);
        }

        // Ensures the user doesn't attach duplicate spreadsheets
        const uniqueTitles = new Set(titles);
        if (uniqueTitles.size < titles.length) {
            await interaction.editReply("You've entered duplicate titles. Please ensure each title is unique.");
            return;
        }
        
        // Assuming oauth2Client is already authenticated
        await sendEmailWithAttachment(filePaths)
            .then(() => console.log('Email sent successfully'))
            .catch(error => console.error('Failed to send email:', error));

        for (const Id of spreadsheetIds){
            moveFileToFolder(Id);
        }
        await interaction.editReply(`Email sent successfully.`);
    }
};

async function authenticateOAuth2Client(oauth2Client) {
    if (fs.existsSync(TOKEN_PATH)) {
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        oauth2Client.setCredentials(tokens);
        console.log("OAuth2 client authenticated with existing tokens.");
        return oauth2Client;
    } else {
        console.error("Token file not found. Please authenticate through OAuth flow.");
        return null;
    }
}

async function exportSpreadsheetAsExcel(spreadsheetId, title) {
    const drive = google.drive({ version: 'v3', auth });

    // Define the path where the downloaded file will be saved
    const filePath = `./workorders/${title}.xlsx`;

    const dest = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
        drive.files.export(
            { fileId: spreadsheetId, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { responseType: 'stream' },
            (err, res) => {
                if (err) {
                    console.error('The API returned an error: ', err);
                    reject(err);
                    return;
                }
                res.data
                    .on('end', () => {
                        // Wait for the stream to finish writing to the file
                        dest.on('finish', () => {
                            console.log(`Spreadsheet exported and saved as ${filePath}`);
                            resolve(filePath);
                        });
                        // Ensure to call end to close the stream
                        dest.end();
                    })
                    .on('error', err => {
                        console.error('Error downloading file:', err);
                        reject(err);
                    })
                    .pipe(dest);
            }
        );
    });
}

async function sendEmailWithAttachment(attachmentPaths) {
    const gmail = google.gmail({version: 'v1', auth: oauth2Client});

    const rawMessage = createEmailMessage(EMAIL_DEST, EMAIL_SUBJECT, EMAIL_BODY, attachmentPaths); 
    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    try {
        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log('Email sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}


function createEmailMessage(to, subject, emailBody, attachmentPaths) {
    const boundary = "000000000000000000000000000";
    const nl = "\n";
    let message = "";

    // Headers
    message += `To: ${to}${nl}`;
    message += `Subject: ${subject}${nl}`;
    message += `Content-Type: multipart/mixed; boundary=${boundary}${nl}${nl}`;

    // Body
    message += `--${boundary}${nl}`;
    message += `Content-Type: text/plain; charset="UTF-8"${nl}${nl}`;
    message += `${emailBody}${nl}${nl}`;

    // Attachments
    attachmentPaths.forEach((attachmentPath) => {
        const filename = path.basename(attachmentPath);
        const contentType = mime.lookup(attachmentPath) || 'application/octet-stream';
        const attachment = fs.readFileSync(attachmentPath).toString('base64');

        message += `--${boundary}${nl}`;
        message += `Content-Type: ${contentType}; name="${filename}"${nl}`;
        message += `Content-Disposition: attachment; filename="${filename}"${nl}`;
        message += `Content-Transfer-Encoding: base64${nl}${nl}`;
        message += `${attachment}${nl}`;
    });

    message += `--${boundary}--`;

    return message;
}

async function moveFileToFolder(fileId) {
    const drive = google.drive({version: 'v3', auth});
    try {
        // Retrieve the existing parents to remove
        let file = await drive.files.get({
            fileId: fileId,
            fields: 'parents'
        });
        let previousParents = file.data.parents.join(',');

        // Move the file to the new folder
        await drive.files.update({
            fileId: fileId,
            addParents: FILLED_FORMS_FOLDER,
            removeParents: previousParents,
            fields: 'id, parents'
        });
    } catch (error) {
        console.error('Error moving file:', error);
    }
}





