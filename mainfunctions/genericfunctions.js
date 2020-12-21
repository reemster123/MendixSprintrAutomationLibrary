// this file defines some generic functions which are used by multiple epics. 

const gv = require('../globalvariables.json');

module.exports = {
    // delay function (sleep for amount of miliseconds)
    delay: function(delaytime) {
        return new Promise(function (resolve) {
            setTimeout(resolve, delaytime);
        });

    },

    // clicknext for selector. 
    clickNext: async function(selector, page) {
        await page.waitForSelector(selector);
        await page.click(selector);
        console.log('clicked next page...');

    },

    getElementForInnerText: async function(innertext, tagname, page) {
        const element = await page.evaluateHandle((name, tag) => {
            const elements = document.getElementsByTagName(tag);
            let i;
            for (i=0;i<elements.length;i++) {
                if (elements[i].innerText.toLowerCase().includes(name)) {
                    return elements[i];
                }
            }
        }, innertext, tagname );
        return element;

    },

    getIdForInnerText: async function(innertext, tagname, page) {
        const elementId = await page.evaluate((name, tag) => { 
            const elements = document.getElementsByTagName(tag);
            let i;
            for (i=0;i<elements.length;i++) {
                if (elements[i].innerText.toLowerCase().includes(name)) {
                    return elements[i].id;
                }
            }
        }, innertext, tagname );
        return elementId;
        
    },

    clickOkOnPopupDialog: async function(page) {
        console.log('Waiting for popup dialog to appear...');
        // this element does not yet exist. first wat for the real page to load
        await page.waitForSelector('.mx-dialog-footer', {timeout: gv.longProcesTimeout});
        console.log('Dialog footer found...');
        const message = await page.evaluate(() => {
            return document.querySelector('.mx-dialog-body').getElementsByTagName('p')[0].innerText;
        });
        console.log('Popup dialog appeard with content: "'+message+'"');
        await page.evaluate(() => {
            document.getElementsByClassName('modal-footer mx-dialog-footer')[0].getElementsByTagName('button')[0].click();
        });
        console.log('Clicked "Okay"...');

    },

    // select a row from a datagrid for the rowtitle and parentDataview
    selectRow: async function(dvSelector, rowTitle, page) {
        rowSelected = await page.evaluate((name, selector) => {
            const dataview = document.querySelector(selector);
            let IsSelected = false;       
            const rows = dataview.getElementsByTagName('tr');
            if (rows != null) {
                // if there is a name then find the row for that name
                if (name != null) {
                    let i;
                    for (i=0; i<rows.length; i++) {
                        const rowname = rows[i].getElementsByClassName('mx-left-aligned')[0].innerText.toLowerCase();
                        if (rowname === name) {
                            rows[i].click();
                            IsSelected = true;
                            break;
                        }   
                    }
                // if name is null then select the first row. 
                } else {
                    rows[0].click();
                    IsSelected = true;
                }
            }
            return IsSelected; 
        }, rowTitle, dvSelector);
        return rowSelected; 

    }
    //  *** extra functions here... ***
}



