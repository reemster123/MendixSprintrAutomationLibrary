// import globalVariables and genericFunctions
const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

// navigateToEnvironmentspage
module.exports = async function(appName, page) {
    //navigate to the apps homepage.
    const appfound = require('./navigateToApp.js')(appName, page);
    if (appfound) { 
        // navigate to environmentspage of app.
        console.log('App with name "'+appName+'" exists...');
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
