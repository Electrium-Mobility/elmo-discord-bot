const { google } = require('googleapis');
const { gmail_id, gmail_secret_id } = require('./config.json')
const fs = require('fs');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  gmail_id,
  gmail_secret_id,
  'http://localhost:3000/oauth2callback' 
);

// Scopes for Gmail API
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

// Generate an authentication URL for the user to grant permission
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

// Start a local server to listen for the OAuth2 callback
const app = http.createServer(async (req, res) => {
  if (req.url.indexOf('/oauth2callback') > -1) {
    // Parse the query parameters to extract the "code" parameter
    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
    const code = qs.get('code');
    res.end('Authentication successful! Please return to the console.');
    server.destroy();

    // Exchange the code for tokens and set the credentials for future use
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save the tokens for later use (e.g., refreshing tokens)
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));

    // Now you can use oauth2Client for authenticated requests to Gmail API
  }
});

const port = 3000;
const server = app.listen(port, () => {
  // Open the browser to the authorize URL to start the OAuth flow
  console.log('Please visit the following URL to authorize:', authUrl);
});

// Ensure the server is properly destroyed on process exit
destroyer(server);
