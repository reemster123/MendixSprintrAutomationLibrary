const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

module.exports = async function(tvSelector, clSelector, itemName, page) {
    let selectedItem = false;

    do {
        console.log('went into dowhile loop');
        //select the branche name from the list of branchenames
        selectedItem = await selectRowTreeview(tvSelector, clSelector, itemName, page); 
        console.log('databaseSelected: '+selectedItem);
        await gf.delay(gv.standardDelayAfterFunction);
        // click 'next list' if the branche has not been selected yet
        if (selectedItem === false) {
            const lastpage = await checkIfLastPage(tvSelector ,page);
            if (!lastpage) {
                console.log('the item is not found on this page, moving to next page...')
                await page.evaluate((tvSelector)=> {
                    const treeview = document.getElementById(tvSelector);
                    const nextbutton = treeview.getElementsByClassName('gv_btn_next')[0];
                    nextbutton.click();
                }, tvSelector);
                await gf.delay(gv.standardDelayAfterFunction);
            } else {
                console.log('This was the last page, item not found...');
                break;    
            }
        }   else {
            console.log('row selected...');
        }
    } while (selectedItem === false);
    return selectedItem;

}

 checkIfLastPage = async (tvSelector, page) => {
    console.log('trying to check if it is lastpage...')
    const isLastPage = await page.evaluate((tvSelector) => {
        const treeview = document.getElementById(tvSelector)
        const nextbutton = treeview.getElementsByClassName('gv_btn_next')[0];
        if (typeof nextbutton === 'undefined') {
            return true;
        }
        return false;
    }, tvSelector);
    return isLastPage;
}

selectRowTreeview = async (tvSelector, clSelector, innertext, page) => {
    const selected = await page.evaluate((tvSelector, clSelector, text ) => {
        const treeview = document.getElementById(tvSelector);
        let columns = treeview.getElementsByClassName(clSelector);
        columns = Array.from(columns);
        // return the column where the title attribute within a span contains the 'date' parameter. 
        const column = columns.find(el => el.querySelector('span[title*="'+text+'"') !== null);
        if (typeof column !== 'undefined') {
            const tr  = column.closest('tr');
            if (tr.classList.contains('gv_selected')) {
                console.info('row is already selected');
            } else {
                column.click();
            }
            return true;
        } else {
            return false;
        }
    }, tvSelector, clSelector, innertext);

    return selected;

}