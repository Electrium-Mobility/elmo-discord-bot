const { SlashCommandBuilder } = require("discord.js");
const { google } = require("googleapis");

const BUDGET_SPREADSHEET_ID = "1CI79qkUH8BpqZAE2hVdAJ2yxF-Qzm9aSER2Dt8Ij_3c";
const TOTAL_LEFT_RANGE = "Inflow!N2:N2"; //cell in spreadsheet that contains the total remaining budget

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});
const sheetClient = auth.getClient();
const googleSheets = google.sheets({ version: "v4", auth: sheetClient });

const getTotalLeft = async () => {
  const response = await googleSheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: BUDGET_SPREADSHEET_ID,
    range: TOTAL_LEFT_RANGE,
  });
  const sheets_raw = response.data.values;
  return sheets_raw[0][0];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("budget")
    .setDescription(
      "Get total available budget from Master Budget Google Sheets"
    ),
  async execute(interaction) {
    const totalLeft = await getTotalLeft();
    await interaction.reply(`Total Budget Remaining: ${totalLeft.toString()}`);
  },
};
