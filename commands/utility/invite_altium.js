const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { SlashCommandBuilder } = require('discord.js');
const { clickup_username } = require('../../credentials.json');
const { clickup_password } = require('../../credentials.json');

const options = new chrome.Options();
options.addArguments('--ignore-certificate-errors');
options.addArguments('--ignore-ssl-errors');
// options.addArguments('--headless');
options.setAcceptInsecureCerts();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('altium_inv')
		.setDescription('sends an Altium invitation')
		.addStringOption(option =>
			option
				.setName('email')
				.setDescription("member's email")
				.setRequired(true))
        .addBooleanOption(option =>
            option
				.setName('admin')
				.setDescription("give member admin permissions")
				.setRequired(true)
            ),
	async execute(interaction) {
        const email = interaction.options.getString('email');
        const admin = interaction.options.getBoolean('admin');
        inviteUser(clickup_username, clickup_password, email, admin) //config
        await interaction.reply({ content: `Invited ${email} to Altium!`, ephemeral: true });
        // await interaction.reply(`This command was run by ${interaction.user.username}`);
    }
}

async function inviteUser(email, password, invite, admin) {
    const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    try {
        driver.get("https://university-of-waterloo-38.365.altium.com/team/members");
        await new Promise(resolve => setTimeout(resolve, 3000));
        //login
        await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/div[1]/div[2]/input')).sendKeys(email);
        await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/div[2]/div[2]/div/input')).sendKeys(password);
        await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/button')).click();
        await new Promise(resolve => setTimeout(resolve, 5000));

        //invite
        
        // await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[1]/div/div[2]/div/div/div/input')).sendKeys(invites);

            await driver.findElement(By.xpath('//*[@id="app-team"]/div/div/div[2]/div[2]/div[3]/div[1]/div[1]/button')).click();
            await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[1]/div/div[2]/div/div/div/input')).sendKeys(invite);
            if(!admin){
                await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).clear();
                await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).sendKeys('Engineers');
            }
            else{
                await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).clear();
                await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).sendKeys('Administrators');
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[4]/div/button[1]')).click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[4]/div/button[1]')).click();
            
            //confirmation button
            await new Promise(resolve => setTimeout(resolve, 1000));
            await driver.findElement(By.xpath('/html/body/div[11]/div/div/div/div[2]/button[1]')).click();
            await new Promise(resolve => setTimeout(resolve, 2000));


    }
    finally{
        driver.quit();
    }
}
