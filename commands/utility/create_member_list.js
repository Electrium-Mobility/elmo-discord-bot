const { google } = require('googleapis');

const APPLICATIONS_SPREADSHEET_ID = "1AM316BM_eS4AqUTPgtgBq2k_iqj2xfHGjwB2FUN7MHs";
const MEMBERS_SPREADSHEET_ID = "16jdx-mM-1kQxB2cNLaTvRDDXp82hHqTXaQSiFIuTH2s";

const auth = new google.auth.GoogleAuth({
	keyFile: "./credentials.json",
	scopes: "https://www.googleapis.com/auth/spreadsheets"
})

const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });

const add_users = async() => {
	const user_info_response = await googleSheets.spreadsheets.values.get({
		auth: auth,
		spreadsheetId: APPLICATIONS_SPREADSHEET_ID,
		majorDimension: "COLUMNS",
		range: "'Form Responses 1'!C2:K",
	});
  	const user_info_raw = user_info_response.data.values;

  	const name = 		user_info_raw[0];
  	const email = 		user_info_raw[4];
  	const WatIAM = email.map((email) => email.split('@')[0]);
  	const discord = 	user_info_raw[6];
  	const program = 	user_info_raw[2];
	const term = 		user_info_raw[3];
	const inPerson = 	user_info_raw[8];

	await googleSheets.spreadsheets.values.update({
		auth: auth,
		spreadsheetId: MEMBERS_SPREADSHEET_ID,
		range: "'Winter 2024'!A2:G",
		valueInputOption: 'RAW',
		resource: {
			majorDimension: "COLUMNS",
			values: [name, WatIAM, email, discord, program, term, inPerson]
		}
	});

	await googleSheets.spreadsheets.values.update({
		auth: auth,
		spreadsheetId: MEMBERS_SPREADSHEET_ID,
		range: "'Winter 2024'!1:1",
		valueInputOption: 'RAW',
		resource: {
			majorDimension: "ROWS",
			values: [["Name", "WatAM", "Email", "Discord", "Program", "Term", "In Person?"]],
			
		}
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('creatememberlist')
        .setDescription('Create Master Member List from Applications Google Form spreadsheet'),
    async execute(interaction) {
		await add_users();
		await interaction.reply("Master Member List Created")
    }
}






// prev code from when I started to line up info role/project assignment sheets as well
// stopped due to missing entries

//  const user_info_range = "'Form Responses 1'!C2:K";
// 	const user_info_response = await googleSheets.spreadsheets.values.get({
// 		auth: auth,
// 		spreadsheetId: APPLICATIONS_SPREADSHEET_ID,
// 		majorDimension: "ROWS",
// 		range: user_info_range,
// 	});
//   	const user_info_raw = user_info_response.data.values;
// 	const user_info_sorted = user_info_raw.sort((a, b) => {
// 		if (a[0] < b[0]) {
//         	return -1;
// 		} else if (a[0] > b[0]) {
// 			return 1;
// 		} else {
// 			return 0;
// 		}
// 	})
//   	const name = 		user_info_sorted.map(i => i[0]);
//   	const email = 		user_info_sorted.map(i => i[4]); //applications_raw[4];
//   	const WatIAM = email.map((email) => email.split('@')[0]);
//   	const discord = 	user_info_sorted.map(i => i[6]);//applications_raw[6];
//   	const program = 	user_info_sorted.map(i => i[2]);// applications_raw[2];
// 	const term = 		user_info_sorted.map(i => i[3]);// applications_raw[3];
// 	const inPerson = 	user_info_sorted.map(i => i[8]);// applications_raw[8];

// 	const assignments_range = "'W24 Project Assignment'!A:L"
// 	const assignments_response = await googleSheets.spreadsheets.values.get({
// 		auth: auth,
// 		spreadsheetId: APPLICATIONS_SPREADSHEET_ID,
// 		majorDimension: "ROWS",
// 		range: assignments_range,
// 	});
//   	const assignments_raw = user_info_response.data.values;
// 	const assignments_sorted = applications_raw.sort((a, b) => {
// 		if (a[0] < b[0]) {
//         	return -1;
// 		} else if (a[0] > b[0]) {
// 			return 1;
// 		} else {
// 			return 0;
// 		}
// 	})