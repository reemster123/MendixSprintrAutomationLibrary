const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');


module.exports = async function(brancheName, page) {
    let packageUploaded = false;
    await page.waitForSelector("#mxui_widget_Wrapper_2", {timeout: gv.standardTimeOutWFS});
    const packagebutton = await page.evaluate(() => {return document.getElementById('mxui_widget_Wrapper_2').innerText});
    await gf.delay(gv.standardDelayAfterFunction);
    await page.hover('#mxui_widget_Wrapper_2');
    await page.click('#mxui_widget_Wrapper_2');
    console.log('clicked "'+packagebutton+'"...');
    await gf.delay(gv.standardDelayAfterPageLoad);
    await page.waitForSelector('#mxui_widget_DataGrid_0', {timeout: gv.extendedTimeOutWFS});
    await page.waitForSelector('.mx-datagrid-body', {timeout: gv.standardTimeOutWFS});
    console.log("branchelist is visible...");
    
    await gf.delay(gv.standardDelayAfterFunction);
    const selectedBranche = await require('./selectListItem.js')(brancheName, page);

    // if branche is selected then click 'next'
    if (selectedBranche) {
        await gf.delay(gv.standardDelayAfterFunction);
        await gf.clickNext('button[class="btn mx-button mx-name-microflowTrigger3 btn-primary"]', page);
        await gf.delay(gv.standardDelayAfterFunction);
        // select latest revision, set versionnumbers and create package.
        selectedRevision = await gf.selectRow('tbody[class="mx-datagrid-body"]', null, page);
        await gf.clickNext('button[class="btn mx-button mx-name-microflowTrigger5 btn-primary"]', page);
        await gf.delay(gv.standardDelayAfterPageLoad);
        await setVersionNumbers(page);
        await gf.delay(gv.standardDelayAfterFunction)
        await gf.clickNext('button[class="btn mx-button mx-name-microflowTrigger25 btn-success"]', page);
        await gf.delay(gv.standardDelayAfterFunction);
        await gf.clickOkOnPopupDialog(page); 
        packageUploaded = true;
    } 
    return packageUploaded;
}


async function setVersionNumbers(page) {
    console.log('setting versionnumbers...');
    await page.waitForSelector('.mx-dataview.mx-name-dataView9');
    await setversionNumber(0, page);
    await setversionNumber(1, page);
    await setversionNumber(2, page);
    console.log('done');

}
// check if the input already has a value, if it does not. then change the value to 1. 
setversionNumber = async (index, page) => {
    let input = await page.evaluateHandle((i) => {
        const versionView = document.getElementsByClassName("mx-dataview mx-name-dataView9")[0]; 
        const inputfield =  versionView.getElementsByTagName('input')[i]; 
        if (inputfield.value === null || inputfield.value === '' ) {
                return inputfield;
            } 
        return null;
    }, index);

    if (input) {
        await input.type('1');
    }


}




