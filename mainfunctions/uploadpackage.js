const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');


module.exports = async function(brancheName, page) {
    let packageUploaded = false;
    await page.waitForSelector("#mxui_widget_Wrapper_2", {timeout: gv.standardTimeOutWFS});
    console.log('clicking upload package button...');
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
    
    selectedBranche = false;
    do {
        //select the branche name from the list of branchenames
        selectedBranche = await gf.selectRow('tbody[class="mx-datagrid-body"]', brancheName, page);
        await gf.delay(gv.standardDelayAfterFunction);
        // click 'next list' if the branche has not been selected yet
        if (selectedBranche === false) {
            const lastpage = await checkIfLastPage('mx-name-paging-next', page);
            if (!lastpage) {
                await gf.clickNext('.mx-name-paging-next', page);
                await gf.delay(gv.standardDelayAfterFunction);
            } else {
                console.log('brancheName "'+brancheName+'" found...');
                break;    
            }
        }   else {
            console.log('branche already selected. Stopping dowhileLoop');
        }
    } while (selectedBranche === false);

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
    await page.waitForSelector('#mxui_widget_DataView_43');
    await page.evaluate(() => {
        const versionView = document.getElementsByClassName("mx-dataview mx-name-dataView9")[0]; 
        const inputfields = versionView.getElementsByTagName('input'); 
        let i;
        for (i=0; i< inputfields.length; i++) {
            if (inputfields[i].value === null) {
                inputfields[i].value = '1';
            }
        }
    });
}

async function checkIfLastPage(classname, page) {
    console.log('trying to check if it is lastpage...')
    const isLastPage = await page.evaluate((classname) => {
        let isLastPage = false;
        const expectedValue = 'disabled';
        const nextbutton = document.getElementsByClassName(classname)[0];
        console.info('Next button: '+nextbutton.innerHTML);
        const hasAttribute = nextbutton.hasAttribute(expectedValue);
        if (hasAttribute) {
            const attValue = nextbutton.getAttribute(expectedValue);
            if(attValue === expectedValue) {
                isLastPage = true;
            } 
        }
        return isLastPage; 
    }, classname);
    console.log('isLastPage = '+isLastPage+'...');
    return isLastPage;
}