const gv = require('../globalvariables.json');


module.exports = async function(appName, page) {
    try {
        await page.goto(gv.myappsUrl, { waitUntil: "networkidle2"});
        console.log('Went to my apps page...');
        await page.waitForSelector('.page-apps__card', {timeout: gv.standardTimeOutWFS});
        console.log('searching for app with name: '+ appName+'...');
        const appfound = await page.evaluate((name) => {
            let appCards = document.querySelectorAll('.page-apps__card');
            const el = appCards.find(card => card.getElementsByTagName('p')[0].innerText.toLowerCase() === name);
            if (typeof el !== 'undefined') {
                el.click();
                return true;
            }
            return false;
        }, appName); 
        return appfound;
    } catch (err) {
        console.log('Something went wrong navigating to app: '+err);
        return false;
    }
}