// import genericFunctions and globalVariables
const gf = require('./mainfunctions/genericfunctions.js');
const gv = require('./globalvariables.json');

// import puppeteer for handing the browser
const puppeteer = require('puppeteer');

// get arguments from commandline
const appName = parseArgumentForIndex(2);
const brancheName = parseArgumentForIndex(3);
console.log('Appname: '+appName);
console.log('Branchename: '+brancheName);

main();
  
async function main() { 
    try {
        //open a browser and setup the page and viewport
        console.log('Opening browser...');
        const browser = await puppeteer.launch({headless: !gv.showProcesInBrowser});
        const page = await browser.newPage();
        await page.setViewport ({
            width: 1600,
            height: 600
        });
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");

        //login with credentials
        await require('./mainfunctions/login.js')(page);
        await gf.delay(gv.standardDelayAfterFunction);

        // navigate from homepage to the environments page for the appName
        const navigationSuccesfull = await require('./mainfunctions/navigateToEnvironmentsPage.js')(appName, page);
        if (navigationSuccesfull) {
            await gf.delay(gv.standardDelayAfterPageLoad);

            // Create deployment package
            const packageUploaded =  true;//await require('./mainfunctions/uploadpackage.js')(brancheName, page);
            await gf.delay(gv.standardDelayAfterPageLoad);
    
            if (packageUploaded) {
                //Deploy package
                await selectDeployablePackage(page); 
                await gf.delay(gv.standardDelayAfterPageLoad);
                await require('./mainfunctions/deploy.js')(page);
            } 
        }
        await gf.delay(gv.standardDelayAfterPageLoad);
        await shutdown(page, browser);
    } catch (error) {
        console.log (error);
    }
};




//  *********** CHILD FUNCTIONS ***********

async function selectDeployablePackage(page) {
    console.log('Trying to select a package to deploy...');
    //wait untill the span element with innertext 'deploy' appears on the first row of the list of packages.
    await page.waitForFunction("document.querySelectorAll('.gv_table')[0].getElementsByClassName('gv_row')[0].getElementsByClassName('gv_cell_Actions')[0].children[0].children[0].children[0].innerText == 'Deploy'", 
                                {timeout: gv.longProcesTimeout});
    await gf.delay(gv.standardDelayAfterFunction);
    await page.evaluate(() => {
        const deploybutton = document.querySelectorAll('.gv_table')[0].getElementsByClassName('gv_row')[0].getElementsByClassName('gv_cell_Actions')[0].children[0].children[0].children[0];
        deploybutton.click();
    });                    
}

function parseArgumentForIndex(i) {
    return process.argv[i].toLowerCase().split(gv.charToReplaceSpace).join(' ');

}

async function shutdown(page, browser) {
    console.log('Deploybot shutting down...');
    await page.close();
    await browser.close();
}









