const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { SlashCommandBuilder } = require('discord.js');
const { clickup_username } = require('../../credentials.json');
const { clickup_password } = require('../../credentials.json');
const { getEmail } = require('../../helperFunctions/google_API_helpers.js');

const options = new chrome.Options();
options.addArguments('--ignore-certificate-errors');
options.addArguments('--ignore-ssl-errors');
options.addArguments('--headless');
options.setAcceptInsecureCerts();

module.exports = {
	data: new SlashCommandBuilder()
        .setName('invitetoclickup')
		.setDescription('sends a clickup invitation')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user we wish to get info on')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const username = await user.username;
        let email = await getEmail(username);
        if (!email) {
            await interaction.reply({ content: 'This user could not be found in the Google Sheet.', ephemeral: true });
        }
        else {
            inviteUser(email) //config
            await interaction.reply({ content: 'An email invite has been sent to the user.', ephemeral: true });
        }
    }
}

async function inviteUser(email) {
    const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    try {
        await driver.get('https://google.com');
        await new Promise(resolve => setTimeout(resolve, 3000));
        await driver.get('https://clickup.com/login');
        
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Assuming your login form has input fields with these IDs
        await driver.findElement(By.xpath('//*[@id="login-email-input"]')).sendKeys(clickup_username);
        await driver.findElement(By.xpath('//*[@id="login-password-input"]')).sendKeys(clickup_password);
        await driver.findElement(By.xpath('//*[@id="app-root"]/cu-login/div/div[2]/div[2]/div[1]/cu-login-form/div/form/button')).click();


        console.log('Logged in successfully');

        await new Promise(resolve => setTimeout(resolve, 6000));
            //MIGHT NEED TO CLOSE A POPUP...?
            // await driver.findElement(By.className('cu-modal__control-item cu-modal__close ng-tns-c3231470687-17')).click();
            // await new Promise(resolve => setTimeout(resolve, 1000));

            //click electrium icon
            await driver.findElement(By.xpath('//*[@id="app-root"]/cu-app-shell/cu-manager/div[1]/div/div/cu-simple-bar/div[1]/div[2]/div/button')).click();
            await new Promise(resolve => setTimeout(resolve, 3000));

            //manage users
            await driver.findElement(By.xpath('//*[@id="cdk-overlay-0"]/cu-workspace-picker/div[1]/div/button[3]')).click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            //type emails
            await driver.findElement(By.xpath('//*[@id="settings-main"]/cu-team-settings/cu-team-users-settings/cu-team-users-settings-view/cu-team-settings/div/div[1]/div[2]/cu-invite-team-user/div/div[1]/input')).sendKeys(email);
            await new Promise(resolve => setTimeout(resolve, 3000));
            await driver.findElement(By.xpath('//*[@id="settings-main"]/cu-team-settings/cu-team-users-settings/cu-team-users-settings-view/cu-team-settings/div/div[1]/div[2]/cu-invite-team-user/div/button')).click();
            await new Promise(resolve => setTimeout(resolve, 5000));

            await driver.quit();
    } finally {
        
    }
}
