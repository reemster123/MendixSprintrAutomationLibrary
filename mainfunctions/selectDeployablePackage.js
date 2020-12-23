const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

module.exports = async function(page) {
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

