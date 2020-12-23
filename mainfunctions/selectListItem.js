const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

module.exports = async function(itemName, page) {
    let selectedItem = false;
    do {
        //select the branche name from the list of branchenames
        selectedItem = await gf.selectRow('tbody[class="mx-datagrid-body"]', itemName, page);
        await gf.delay(gv.standardDelayAfterFunction);
        // click 'next list' if the branche has not been selected yet
        if (selectedItem === false) {
            const lastpage = await checkIfLastPage('mx-name-paging-next', page);
            if (!lastpage) {
                await gf.clickNext('.mx-name-paging-next', page);
                await gf.delay(gv.standardDelayAfterFunction);
            } else {
                console.log('itenName "'+itemName+'" found...');
                break;    
            }
        }   else {
            console.log('branche already selected. Stopping dowhileLoop');
        }
    } while (selectedItem === false);
    return selectedItem;

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