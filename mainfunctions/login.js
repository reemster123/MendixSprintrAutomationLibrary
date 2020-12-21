// require credentials, and genericfunctions like delay and define sprinterLoginUrl
const credentials = require('../credentials.json');
const gf = require('./genericfunctions.js');
const gv = require('../globalvariables.json');
const sprintrLoginUrl = 'https://login.mendix.com/oidp/login';

// enter username and password and click on login.
module.exports = async function(page) {
    console.log('logging into sprinter environment...');
    await page.goto(sprintrLoginUrl, {waitUntil: 'networkidle2'} ); 
    await page.waitForSelector('#input-username');
    await page.waitForSelector('#input-password');
    await page.waitForSelector('#login-button'); 
    await page.type('#input-username', credentials.username);
    await gf.delay(gv.standardDelayAfterFunction); 
    await page.type('#input-password', credentials.password);
    await gf.delay(gv.standardDelayAfterFunction); 
    await page.click('input[id="login-button"]');
}