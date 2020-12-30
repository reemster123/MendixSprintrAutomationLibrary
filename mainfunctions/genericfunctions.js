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
            let elements = document.getElementsByTagName(tag);
            elements = Array.from(elements);
            el = elements.find(element => element.innerText.toLowerCase().includes(name));
            if (typeof el !== 'undefined') {
                return el;
            }
            return null;
        }, innertext, tagname );
        return element;

    },

    getElementForInnerTextAndParent: async function(innertext, tagname, parent, page) {
        const element = await page.evaluateHandle((name, tag, parent) => {
            let elements = parent.getElementsByTagName(tag);
            elements = Array.from(elements);
            el = elements.find(element => element.innerText.toLowerCase().includes(name));
            if (typeof el !== 'undefined') {
                return el;
            }
            return null;
        }, innertext, tagname, parent );
        return element;

    },

    getIdForInnerText: async function(innertext, tagname, page) {
        const elementId = await page.evaluate((name, tag) => { 
            let elements = document.getElementsByTagName(tag);
            elements = Array.from(elements);
            el = elements.find(element => element.innerText.toLowerCase().includes(name));
            if (typeof el !== 'undefined') {
                return el.id;
            } 
            return null;
        }, innertext, tagname );
        return elementId;
        
    },

    getIdForInnerTextAndParent: async function(innertext, tagname, parent, page) {
        const elementId = await page.evaluate((name, tag, parent) => { 
            let elements = parent.getElementsByTagName(tag);
            elements = Array.from(elements);
            el = elements.find(element => element.innerText.toLowerCase().includes(name));
            if (typeof el !== 'undefined') {
                return el.id;
            } 
            return null;
        }, innertext, tagname, parent );
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
            let rows = dataview.getElementsByTagName('tr');
            if (rows != null) {
                rows = Array.from(rows);
                // if there is a name then find the row for that name
                if (name != null) {
                    const row = rows.find(element => element.getElementsByClassName('mx-left-aligned')[0].innerText.toLowerCase() === name);
                    if (typeof row !== 'undefined') {
                        // it could be that the row is already selected by default.
                        if (row.classList.contains('selected')) {
                            console.info('row is already selected');
                        } else {
                            row.click();
                        }
                        IsSelected = true;
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
    },

    parseArgumentForIndex: function(i) {
        return process.argv[i].toLowerCase().split(gv.charToReplaceSpace).join(' ');
    },

    selectItemFromDropdown: async function(page) {
        const dropdownButton = await page.waitForSelector('.dropdown-button');
        await dropdownButton.click();
        console.log('Clicked dropdown menu...');
        const dropdownMenu = await page.waitForSelector('.dropdown-menu');
        await page.evaluate((menu, env) => {
            let listItems = menu.getElementsByTagName('li');
            listItems = Array.from(listItems);
            console.info('found listItems: '+listItems);
            listItems.find(item => item.getElementsByTagName('label')[0].innerText.toLowerCase() === env).click(); 
            console.info('clicked environment...');     
        }, dropdownMenu, gv.environment);
    },

    selectFromRadioButtons: async (surroundingElement, radiobuttonSelector, page) => {
        const clickedDbOnly = await page.evaluate((element, selector) => {
            const radioButton = element.querySelector(selector);
            if (radioButton !== null) {
                radioButton.click();
                return true;
            } 
            return false;
        }, surroundingElement, radiobuttonSelector); 
        return clickedDbOnly;
    },

    shutdown: async function(page, browser) {
        console.log('Deploybot shutting down...');
        await page.close();
        await browser.close();
    }

    //  *** extra functions here... ***
}

