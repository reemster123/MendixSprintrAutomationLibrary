// import globalVariables and genericFunctions
const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

// navigateToEnvironmentspage
module.exports = async function(appName, page) {
     await page.goto(gv.myappsUrl, { waitUntil: "networkidle2"});
     console.log('Went to my apps page...');
     await page.waitForSelector('.page-apps__card', {timeout: gv.standardTimeOutWFS});
     console.log('searching for app with name: '+ appName+'...');
     const appfound = await page.evaluate((name) => {
        let appCards = document.querySelectorAll('.page-apps__card');
        // appcards isnt an actual array, it is a DOMobject. we should create an array from it and then we can find/map/filer etc.
        appCards = Array.from(appCards);
        const el = appCards.find(card => card.getElementsByTagName('p')[0].innerText.toLowerCase() === name);
        if (typeof el !== 'undefined') {
             el.click();
             return true;
        }
        return false;
    }, appName); 
 
    if (appfound) { 
        await page.waitForSelector('#formatstring_widget_formatstring_14', {timeout: gv.standardTimeOutWFS});       
        const envElement = await page.$('#formatstring_widget_formatstring_14');
        // wait extra seconds for page to load, this page takes some time.
        await gf.delay(gv.standardDelayAfterPageLoad);
        await clickOnEnvironments(envElement, page);
    } else {
        console.log('Appname not found...');
    }
    return appfound;    
}

async function clickOnEnvironments(envElement, page) {
    const anchorTagHtml = await page.evaluate((env)=> { 
        return env.children[0].innerHTML;
    }, envElement);
    console.log('Navigating to Environments page...');
    let envLink = anchorTagHtml.split("\"")[1].split("\"")[0];
    console.log('envUrl: '+envLink );
    await page.goto(envLink, {waitUntil: 'networkidle2'} );
}
