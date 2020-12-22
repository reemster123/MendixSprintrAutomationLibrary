const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

module.exports = async function(elementId, page) {
    await page.waitForSelector(elementId, {timeout: gv.standardTimeOutWFS});       
    const envElement = await page.$(elementId);
    // wait extra seconds for page to load, this page takes some time.
    await gf.delay(gv.standardDelayAfterPageLoad);
    await goToUrlFromElement(envElement, page);

}

async function goToUrlFromElement(envElement, page) {
    const anchorTagHtml = await page.evaluate((env)=> { 
        return env.children[0].innerHTML;
    }, envElement);
    console.log('Navigating to Environments page...');
    let envLink = anchorTagHtml.split("\"")[1].split("\"")[0];
    console.log('envUrl: '+envLink );
    await page.goto(envLink, {waitUntil: 'networkidle2'} );
}