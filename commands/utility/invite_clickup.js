const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const options = new chrome.Options();
options.addArguments('--ignore-certificate-errors');
options.addArguments('--ignore-ssl-errors');
options.setAcceptInsecureCerts();

async function inviteUser(email, password, invites) {
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
        await driver.findElement(By.xpath('//*[@id="login-email-input"]')).sendKeys(email);
        await driver.findElement(By.xpath('//*[@id="login-password-input"]')).sendKeys(password);
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
            for(let i = 0; i < invites.length; i++){
                await driver.findElement(By.xpath('//*[@id="settings-main"]/cu-team-settings/cu-team-users-settings/cu-team-users-settings-view/cu-team-settings/div/div[1]/div[2]/cu-invite-team-user/div/div[1]/input')).sendKeys(invites[i]);
                await new Promise(resolve => setTimeout(resolve, 3000));
                await driver.findElement(By.xpath('//*[@id="settings-main"]/cu-team-settings/cu-team-users-settings/cu-team-users-settings-view/cu-team-settings/div/div[1]/div[2]/cu-invite-team-user/div/button')).click();
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        
    } finally {
        await driver.quit();
    }
}

// INFO
const username = '';
const password = '';
const emailToInvite = ['jenniferli8263@gmail.com', 'example@gmail.com'];

inviteUser(username, password, emailToInvite);
