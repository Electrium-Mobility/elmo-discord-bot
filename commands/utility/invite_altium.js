// const { Builder, By, Key, until } = require('selenium-webdriver');
// const chrome = require('selenium-webdriver/chrome');

// const options = new chrome.Options();
// options.addArguments('--ignore-certificate-errors');
// options.addArguments('--ignore-ssl-errors');
// options.addArguments('--headless');
// options.setAcceptInsecureCerts();

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('altium_inv')
// 		.setDescription('sends a altium invitation')
// 		.addStringOption(option =>
// 			option
// 				.setName('email')
// 				.setDescription('members email')
// 				.setRequired(true))
//         .addBooleanOption(option =>
//             option.setName('admin')
//                 .setDescription('admin')
//                 .setRequired(true)),
// 	async execute(interaction) {
//         const email = interaction.options.getString('email');
//         inviteUser(, email, admin) //config
//     }
// }

// async function inviteUser(email, password, invites) {
//     const driver = await new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(options)
//     .build();
//     try {
//         driver.get("https://university-of-waterloo-38.365.altium.com/team/members");
//         await new Promise(resolve => setTimeout(resolve, 3000));
//         //login
//         await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/div[1]/div[2]/input')).sendKeys(email);
//         await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/div[2]/div[2]/div/input')).sendKeys(password);
//         await driver.findElement(By.xpath('//*[@id="auth-module-page"]/div/main/div/div[2]/div/form/button')).click();
//         await new Promise(resolve => setTimeout(resolve, 5000));

//         //invite
        
//         // await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[1]/div/div[2]/div/div/div/input')).sendKeys(invites);

//         for(let i = 0; i < invites.length; i++){
//             await driver.findElement(By.xpath('//*[@id="app-team"]/div/div/div[2]/div[2]/div[3]/div[1]/div[1]/button')).click();
//             await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[1]/div/div[2]/div/div/div/input')).sendKeys(invites[i].email);
//             if(!invites[i].admin){
//                 await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).clear();
//                 await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).sendKeys('Engineers');
//             }
//             else{
//                 await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).clear();
//                 await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[2]/div/div[2]/div/div/div[1]/input')).sendKeys('Administrators');
//             }
//             await new Promise(resolve => setTimeout(resolve, 3000));
//             await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[4]/div/button[1]')).click();
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             await driver.findElement(By.xpath('/html/body/div[10]/div/div[2]/div/form/div[4]/div/button[1]')).click();
            
//             //confirmation button
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             await driver.findElement(By.xpath('/html/body/div[11]/div/div/div/div[2]/button[1]')).click();
//             await new Promise(resolve => setTimeout(resolve, 2000));
            
//         }


//     }
//     finally{
//         driver.quit();
//     }
// }

// const username = 'j444li@uwaterloo.ca';
// const password = 'Myor910v!';
// const test = "jenniferli8263@gmail.com"
// const emailsToInvite = [
//     {
//         email:'ymotahha@uwaterloo.ca',
//         admin: false
//     },
// ];

// inviteUser(username, password, emailsToInvite);