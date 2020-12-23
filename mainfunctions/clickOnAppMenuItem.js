const gv = require('../globalvariables.json');

module.exports = async function(elementId, page) {
    await page.waitForSelector(elementId, {timeout: gv.standardTimeOutWFS});       
    const envElement = await page.$(elementId);
    await goToUrlFromElement(envElement, page);

}

async function goToUrlFromElement(envElement, page) {
    const anchorTagHtml = await page.evaluate((env)=> { 
        return env.children[0].innerHTML;
    }, envElement);
    console.log('clicked on menuItem...');
    let envLink = anchorTagHtml.split("\"")[1].split("\"")[0];
    await page.goto(envLink, {waitUntil: 'networkidle2'} );
}
