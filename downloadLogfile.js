const gv = require('./globalvariables.json');
const gf = require('./mainfunctions/genericfunctions.js');
const puppeteer = require('puppeteer');
const appName = gf.parseArgumentForIndex(2);
const date = gf.parseArgumentForIndex(3);
const downloadsFolder = require('downloads-folder');
 
console.log(downloadsFolder());
console.log('appName: '+appName);
console.log('Date: '+date);

main();

async function main() {
    try {
        //open a browser and setup the page and viewport
        console.log('Opening browser...');
        const browser = await puppeteer.launch({headless: !gv.showProcesInBrowser});
        const page = await require('./mainfunctions/setuppage.js')(browser);
        
        //login with credentials
        await require('./mainfunctions/login.js')(page);
        await gf.delay(gv.standardDelayAfterFunction);

        // navigate from homepage to the environments page for the appName
        const navigationSuccesfull = await require('./mainfunctions/navigateToApp.js')(appName, page);
        if (navigationSuccesfull) {
            console.log('We are now on the apps homepage...');
            await gf.delay(gv.standardDelayAfterPageLoad);
            // click on the "logs" menu item.
            await require('./mainfunctions/clickOnAppMenuItem')('.mx-name-container21.submenu-group', 2, page);
            await gf.delay(gv.standardDelayAfterPageLoad);
            
            await gf.selectItemFromDropdown(page);
            console.log('We are now on the logs page...');
            await gf.delay(gv.standardDelayAfterPageLoad);

            const selected = await require('./mainfunctions/selectListItem')(date, page);
            await gf.delay(gv.standardDelayAfterFunction);
            if (selected) {
                const downloadButton = await gf.getElementForInnerText('download archived log', 'button', page);
                await gf.delay(gv.standardDelayAfterFunction);
                await downloadButton.click();
                console.log('Clicked downloadbutton...');
                await gf.delay(gv.standardDelayAfterPageLoad);
                await require('./mainfunctions/logPathToFile.js')('logs', date, gv.longProcesTimeout, true);
            }
        }

        await gf.delay(gv.longProcesTimeout);
        await gf.shutdown(page, browser);
    } catch (err) {
        console.log('Something went wrong: '+err);
    }

}
