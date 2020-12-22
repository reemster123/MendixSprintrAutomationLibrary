
// navigateToEnvironmentspage
module.exports = async function(appName, page) {
    //navigate to the apps homepage.
    const appfound = await require('./navigateToApp.js')(appName, page);
    if (appfound) { 
        console.log('App with name "'+appName+'" exists...');
        // go to the environments page
        await require('./clickOnAppMenuItem')('#formatstring_widget_formatstring_14', page);
    } else {
        console.log('Appname not found...');
    }
    return appfound;    
}

