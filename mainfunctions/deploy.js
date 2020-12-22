
// import globalvariables and genericfunctions to support this function.
const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');


module.exports = async function(page) {
    console.log('trying to select the '+gv.environment+' envionment...');
    try {
        await page.waitForSelector('div[class="mx-listview mx-listview-selectable mx-listview-clickable mx-name-listView2 loft-list transport-lofts"]');
        const envListItem = await page.evaluateHandle((env)=>{
            let listitem = null; 
            const envList = document.querySelector('div[class="mx-listview mx-listview-selectable mx-listview-clickable mx-name-listView2 loft-list transport-lofts"]').getElementsByTagName('li');
            loop1: 
            for (let i=0;i<envList.length;i++) {
                const labels = envList[i].getElementsByTagName('label');
            loop2:
                for (let x=0;x<labels.length;x++) {
                    if (labels[x].innerText.toLowerCase() === env) {
                        envList[i].click();
                        listitem = envList[i];
                        break loop1;
                    }
                } 
            }
            return listitem;
        }, gv.environment);
        
        // wait sothat the button class is set to enabled (default app behaviour after selecting an environment) else it will try to click the disables one.  
        await gf.delay(gv.standardDelayAfterFunction);
        // get button for listitem after button class has changed to enabled = true. 
        await page.evaluate((listitem) =>{
            listitem.getElementsByTagName('button')[0].click();   
        }, envListItem);
        await gf.delay(gv.standardDelayAfterFunction);
        // close popup diaglog after moving package
        await gf.clickOkOnPopupDialog(page);
        await gf.delay(gv.standardDelayAfterPageLoad);
        console.log('checking if continuebutton is there...');
        const buttonAvailable = await page.evaluate(()=> {
            const button = document.querySelector('button[class="btn mx-button mx-name-microflowTrigger18 btn-primary"]');
            if (button === null) {
                return false; 
            } else {
                return true;
            }
        });

        if (buttonAvailable) {
            console.log('continuebutton is avaiable. continueing normal proces...')
            await gf.delay(gv.standardDelayAfterFunction);
            // click continue 
            await gf.clickNext('button[class="btn mx-button mx-name-microflowTrigger18 btn-primary"]', page);
            await gf.delay(gv.standardDelayAfterFunction);
            // restart application.
            console.log('restaring application...');
            await page.waitForSelector('.mx-groupbox-body');
            // for some reason the Id of the startapplication button changes per session. so we get the buttons ID for the innertext. 
            const elementId = await gf.getIdForInnerText('start application', 'button', page);
            await gf.clickNext('button[id="'+elementId+'"', page);
            await page.waitForSelector('a[class="mx-name-tabPage7"]', {timeout: gv.longProcesTimeout});
            await gf.delay(gv.standardDelayAfterFunction);
            await gf.clickOkOnPopupDialog(page);
            console.log('deploy succesfull!');
            
        } else {
            console.log('ContinueButton not found. Starting alternative process...');
            await gf.delay(gv.standardDelayAfterFunction);
            await page.waitForSelector('span[title="Environments"]');
            await page.evaluate(()=>{
                return document.querySelector('span[title="Environments"]').children[0].click();
            });
            console.log('environments button clicked...');
            await gf.delay(gv.standardDelayAfterPageLoad);
            await page.waitForSelector('.cloud-environment-mode');
            await page.evaluate((env)=> {
                let environments = document.querySelectorAll('.cloud-environment-mode');
                environments = Array.from(environments);    
                const rightEnv = environments.find(el => el.innerText.toLowerCase() === env);
                let buttons = rightEnv.closest('tr').getElementsByTagName('button');
                buttons = Array.from(buttons);
                const rightButton = buttons.find(el => el.innerText.toLowerCase() === 'details');
                rightButton.click();
            }, gv.environment);

            console.log('clicked details on '+gv.environment+' environment...');
            await gf.delay(gv.standardDelayAfterPageLoad);
            const restartButton = await gf.getElementForInnerText('restart application', 'button', page);
            await restartButton.click();
            console.log('clicked restartbutton...');
            await gf.clickOkOnPopupDialog(page);
            console.log('deploy succesfull!');
        }
    } catch (err) {
        console.log('something went wrong: '+err);
    }
}
