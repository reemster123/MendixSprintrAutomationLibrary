const gf = require('./genericfunctions.js');
const gv = require('../globalvariables.json');

// navigateToEnvironmentspage
module.exports = async function(appName, page) {
    //navigate to the apps homepage.
    const appfound = await require('./navigateToApp.js')(appName, page);
    await gf.delay(gv.standardDelayAfterPageLoad);
    if (appfound) { 
        console.log('App with name "'+appName+'" exists...');
        // go to the environments page
        await require('./clickOnAppMenuItem')('#formatstring_widget_formatstring_14', page);
        console.log('We are now on the environments page...');
    } else {
        console.log('Appname not found...');
    }
    return appfound;    
}

