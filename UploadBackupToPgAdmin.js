const gv = require('./globalvariables.json');
const gf = require('./mainfunctions/genericfunctions.js');
const cred = require('./credentials.json');
const downloadsFolder = require('downloads-folder');

const puppeteer = require('puppeteer');
const appName = gf.parseArgumentForIndex(2);
const date = gf.parseArgumentForIndex(3);

console.log('Path to DL-folder: '+downloadsFolder());
console.log('appName: '+appName);
console.log('Date: '+date);


main();

async function main() {
    try {
        //open a browser and setup the page and viewport
        console.log('Opening browser...');
        const browser = await puppeteer.launch({headless: !gv.showProcesInBrowser});
        const page = await require('./mainfunctions/setuppage.js')(browser);

        // fire the download backupprocess and return the path to downloaded file. 
        const filePath = await require('./mainfunctions/downloadBackup.js')(appName, date, page);
        
        // goto pgadmin page
        await page.goto(cred.pgAdminUrl, {waitUntil: 'networkidle2'} );
        await gf.delay(gv.standardDelayAfterFunction);
        const menu = await page.waitForSelector('div[id="0"]');

        // login
        const serverSpan = await gf.getElementForInnerTextAndParent('servers', 'span', menu, page);
        const serverButton = await page.evaluateHandle((span) => {return span.closest('.aciTreeEntry').querySelector('.aciTreeButton')}, serverSpan);
        await serverButton.click();
        await gf.delay(gv.standardDelayAfterFunction);
        await page.waitForSelector('#password');
        await page.type('#password', cred.pgAdminPass);
        await gf.delay(gv.standardDelayAfterFunction);
        await page.waitForSelector('button[class="ajs-button btn btn-primary fa fa-check pg-alertify-button"]');
        await page.click('button[class="ajs-button btn btn-primary fa fa-check pg-alertify-button"]');
        await gf.delay(gv.standardDelayAfterFunction);

        // it could be that there are messageboxes open from older restore sessions, close those first
        const msgBxAvailable = await page.evaluate(() => {
            const msgBox = document.querySelector('.ajs-message.ajs-bg-bgprocess.ajs-visible');
            if (msgBox !== null) {
                console.log('Msgbox= '+msgBox);
                return true;
            } else {
                console.info('no msgBox found...')
                return false;
            } 
        });

        if (msgBxAvailable) {
            await page.evaluate(()=>{
                let arr = document.querySelectorAll('.ajs-message.ajs-bg-bgprocess.ajs-visible');
                console.log('msgBoxList= '+arr);
                arr = Array.from(arr);
                arr.map(el => el.querySelector('.pg-bg-close').click());
            });
            console.log('Closed all older messageboxes...');
        } else {
            console.log('No older messageboxes open...');
        }

        // this objectMenuItem can also be retrieved by id= mnu_obj
        const objectMenuItem = await gf.getElementForInnerText('object ', 'a', page);
        await objectMenuItem.click();
        await gf.delay(gv.standardDelayAfterFunction);
        const parentOfObjectMenuItem = await page.evaluateHandle((menuItem)=> menuItem.parentElement, objectMenuItem);
        let createMenuItem = await gf.getElementForInnerTextAndParent('create', 'span', parentOfObjectMenuItem, page);
        await createMenuItem.hover();
        await gf.delay(gv.standardDelayAfterFunction);

        const databaseMenuItem = await gf.getElementForInnerTextAndParent('database...', 'span', parentOfObjectMenuItem, page);
        await databaseMenuItem.click();
        console.log('clicked');
        await gf.delay(gv.standardDelayAfterFunction);
        
        // enter dbname field
        const createDbPopup = await page.waitForSelector('.wcFrame.wcWide.wcTall.wcFloating');
        const dbNameInput = await page.evaluateHandle((popup) => popup.querySelector('input[name="name"]'), createDbPopup); 
        const dbName = appName.toUpperCase()+'_'+gv.environment.toUpperCase()+'_'+date;
        await dbNameInput.type(dbName);
        await gf.delay(gv.standardDelayAfterFunction);
        
        // click save
        const saveButton = await page.evaluateHandle((popup) => popup.querySelector('button[type="save"]'), createDbPopup); 
        await saveButton.click();
        console.log('Clicked save...');
        console.log('Database created with name: '+dbName);
        await gf.delay(gv.standardDelayAfterPageLoad);
      
        const newDb = await gf.getElementForInnerTextAndParent(dbName.toLowerCase(), 'span', menu, page);
        await newDb.click();
        console.log(dbName+' selected...');
        await gf.delay(gv.standardDelayAfterFunction);

        // Open the restore popup for the selected DB
        const toolsMenuItem = await page.waitForSelector('#mnu_tools');
        await toolsMenuItem.click();
        await gf.delay(gv.standardDelayAfterFunction);
        const restoreMenuItem = await page.waitForSelector('#restore_object');
        await restoreMenuItem.click();
        await gf.delay(gv.standardDelayAfterFunction);
        console.log('Restore popup opened...');

        // fill in the fields on the restore popup
        const restorePopup = await page.waitForSelector('.ajs-dialog.pg-el-container');
        console.log('Restore popup found...');
        const filenameInput = await page.evaluateHandle((popup) => popup.querySelector('input[name="file"]'), restorePopup )
        console.log('Filename input found...');
        await filenameInput.type(filePath);
        console.log('typed filename: '+filePath);
        await gf.delay(gv.standardDelayAfterFunction);
 
        const roleDropdown = await page.evaluateHandle((popup) => popup.querySelector('span[title="role"]'), restorePopup);
        await roleDropdown.click();
        console.log('Clicked on roleDropdown...');
        await gf.delay(gv.standardDelayAfterFunction);

        console.log('found rolename dropdown...');
        await gf.delay(gv.standardDelayAfterFunction);

        const searchResultsUl = await page.waitForSelector('.select2-results__options');
        const selectedRole = await gf.getElementForInnerTextAndParent(gv.pgRoleName, 'span', searchResultsUl,  page);
        await selectedRole.click();
        console.log('clicked rolename in list...');
        await gf.delay(gv.standardDelayAfterFunction);

        // click save
        const restoreButton = await page.evaluateHandle((popup) => popup.querySelector('.ajs-button.btn.btn-primary.fa.fa-upload.pg-alertify-button'), restorePopup); 
        await restoreButton.click();
        console.log('clicked "Restore"...');
        await gf.delay(gv.standardDelayAfterPageLoad);
        
        // wait for restore to finish (when the message != "Started" || "Running..."") and log message.
        console.log('Waiting for restore to be completed...');
        await page.waitForFunction(
            '(document.querySelector(".ajs-message.ajs-bg-bgprocess.ajs-visible").querySelector(".pg-bg-status-text").innerText != "Running...") && (document.querySelector(".ajs-message.ajs-bg-bgprocess.ajs-visible").querySelector(".pg-bg-status-text").innerText != "Started")'
            , {timeout: gv.longProcesTimeout});
        const msgContent = await page.evaluate(() => document.querySelector(".ajs-message.ajs-bg-bgprocess.ajs-visible").querySelector(".pg-bg-status-text").innerText);
        console.log('Restore finished with message: "'+msgContent+'"');

        gf.shutdown(page, browser);
        
    } catch (err) {
        console.log('something went wrong '+err);
    } 
}


