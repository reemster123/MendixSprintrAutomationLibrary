const gv = require('../globalvariables.json');


module.exports = async function(appName, page) {
    try {
        await page.goto(gv.myappsUrl, { waitUntil: "networkidle2"});
        console.log('Went to my apps page...');
        await page.waitForSelector('.mps-c-card-app', {timeout: gv.standardTimeOutWFS});
        console.log('searching for app with name: '+ appName+'...');
        const appfound = await page.evaluate((name) => {
            let appCards = document.querySelectorAll('.mps-c-card-app');
            appCards = Array.from(appCards);
            const el = appCards.find(card => card.getElementsByTagName('h2')[0].innerText.toLowerCase() === name);
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
