const gv = require('./globalvariables.json');
const gf = require('./mainfunctions/genericfunctions.js');
const downloadsFolder = require('downloads-folder');

const puppeteer = require('puppeteer');
const appName = gf.parseArgumentForIndex(2);
const date = gf.parseArgumentForIndex(3);
const dateForPath = gf.parseArgumentForIndex(3).split('-').join('');

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
        
        // fire the download backup process and return the path to downloaded file. 
        const filePath = await require('./mainfunctions/downloadBackup.js')(appName, date, page);

        // close proces no matter the outcome. 
        await gf.delay(gv.standardDelayAfterPageLoad);
        await gf.shutdown(page, browser);
    } catch (err) {
        console.log('Something went wrong in DownLoadDB.js: '+err);
    }
}

