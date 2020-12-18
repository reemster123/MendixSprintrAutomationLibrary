//personal settings
const longProcesTimeout = 600000 // wait 10minutes, for all the longtaking processes (uploading package file, restarting application etc )
const standardDelayAfterFunction = 2000;
const standardDelayAfterPageLoad = 5000;
const standardTimeOutWFS = 60000; // standard 1 minute Wait For Selectors (wfs) to appear on the site (mendix sprinter env loads slow)
const extendedTimeOutWFS = 300000 // clicking on 'create package from teamserver' tends to take a long time 
const showProcesInBrowser = true; 
const environment = 'acceptance'; // environment to deploy to. 

//constants do not change.
const puppeteer = require('puppeteer');
const credentials = require('./credentials.json');
const sprintrLoginUrl = 'https://login.mendix.com/oidp/login';
const appName = process.argv[2].replace('_', ' ').toLowerCase();
const brancheName = process.argv[3].replace('_', ' ').toLowerCase();
const myappsUrl = 'https://sprintr.home.mendix.com/link/myapps';
console.log('Appname: '+appName);
console.log('Branchename: '+brancheName);

main();

async function main() { 
    try {
        //open a browser and setup the page and view
        console.log('Opening browser...');
        const browser = await puppeteer.launch({headless: !showProcesInBrowser});
        const page = await browser.newPage();
        await page.setViewport ({
            width: 1600,
            height: 600
        });
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");

        //login with credentials
        await login(page, credentials, standardDelayAfterFunction);
        await delay(standardDelayAfterFunction);

        // navigate from homepage to the environments page for the appName
        const navigationSuccesfull = await navigateToEnvironmentsPage(appName ,standardTimeOutWFS, standardDelayAfterPageLoad, page);
        if (navigationSuccesfull) {
            await delay(standardDelayAfterPageLoad);

            // Create deployment package
            const packageUploaded = await uploadPackage(brancheName, standardDelayAfterPageLoad,standardDelayAfterFunction, standardTimeOutWFS, extendedTimeOutWFS ,page)
            await delay(standardDelayAfterPageLoad);
    
            if (packageUploaded) {
                //Deploy package
                await selectDeployablePackage(page, standardDelayAfterFunction); 
                await delay(standardDelayAfterPageLoad);
                await deploy(environment, standardDelayAfterFunction ,standardDelayAfterPageLoad, longProcesTimeout  ,page);
            } 
        }
        await delay(standardDelayAfterPageLoad);
        await shutdown(page, browser);
    } catch (error) {
        console.log (error);
    }
};



//  *********** MAIN FUNCTIONS ***********


async function login(page, credentials, delaytime ) {
    console.log('logging into sprinter environment...');
    await page.goto(sprintrLoginUrl, {waitUntil: 'networkidle2'} ); 
    await page.waitForSelector('#input-username');
    await page.waitForSelector('#input-password');
    await page.waitForSelector('#login-button'); 
    await page.type('#input-username', credentials.username);
    await delay(delaytime); 
    await page.type('#input-password', credentials.password);
    await delay(delaytime); 
    await page.click('input[id="login-button"]');
}

async function navigateToEnvironmentsPage(appName ,standardTimeOutWFS, standardDelayAfterPageLoad, page) {
    // nagivate to myapps page via myapps url
    await page.goto(myappsUrl, { waitUntil: "networkidle2"});
    console.log('Went to my apps page...');
    const appfound = await page.waitForSelector('.page-apps__card', {timeout: standardTimeOutWFS});
    console.log('searching for app with name: '+ appName+'...');
    await page.evaluate((name) => {
        let appfound = false;
        const appCards = document.querySelectorAll('.page-apps__card');
        appCards.forEach(appCard => {
            const title = appCard.getElementsByTagName('p')[0];
            console.log('App: '+title)
            if (title.innerText.toLowerCase() === name) {
                appfound = true;
                appCard.click();     
            }    
        });
    }, appName); 

    if (appfound) { 
        await page.waitForSelector('#formatstring_widget_formatstring_14', {timeout: standardTimeOutWFS});       
        const envElement = await page.$('#formatstring_widget_formatstring_14');
        // wait extra seconds for page to load, this page takes some time.
        await delay(standardDelayAfterPageLoad);
        await clickOnEnvironments(envElement, page);
    } else {
        console.log('Appname not found...');
    }
    return appfound;
}

async function uploadPackage(brancheName, standardDelayAfterPageLoad,standardDelayAfterFunction, standardTimeOutWFS, extendedTimeOutWFS ,page) {
    let packageUploaded = false;
    await page.waitForSelector("#mxui_widget_Wrapper_2", {timeout: standardTimeOutWFS});
    console.log('clicking upload package button...');
    const packagebutton = await page.evaluate(() => {return document.getElementById('mxui_widget_Wrapper_2').innerText});
    await delay(standardDelayAfterFunction);
    await page.hover('#mxui_widget_Wrapper_2');
    await page.click('#mxui_widget_Wrapper_2');
    console.log('clicked "'+packagebutton+'"...');
    await delay(standardDelayAfterPageLoad);
    await page.waitForSelector('#mxui_widget_DataGrid_0', {timeout: extendedTimeOutWFS});
    await page.waitForSelector('.mx-datagrid-body', {timeout: standardTimeOutWFS});
    console.log("branchelist is visible...");
    await delay(standardDelayAfterFunction);
    
    selectedBranche = false;
    do {
        //select the branche name from the list of branchenames
        selectedBranche = await selectRow('tbody[class="mx-datagrid-body"]', brancheName, page);
        await delay(standardDelayAfterFunction);
        // click 'next list' if the branche has not been selected yet
        if (selectedBranche === false) {
            const lastpage = await checkIfLastPage('mx-name-paging-next', page);
            if (!lastpage) {
                await clickNext('.mx-name-paging-next', page);
                await delay(standardDelayAfterFunction);
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
        await delay(standardDelayAfterFunction);
        clickNext('button[class="btn mx-button mx-name-microflowTrigger3 btn-primary"]', page);
        await delay(standardDelayAfterFunction);
        // select latest revision, set versionnumbers and create package.
        selectedRevision = await selectRow('tbody[class="mx-datagrid-body"]', null, page);
        await clickNext('button[class="btn mx-button mx-name-microflowTrigger5 btn-primary"]', page);
        await delay(standardDelayAfterPageLoad);
        await setVersionNumbers(page);
        await delay(standardDelayAfterFunction)
        await clickNext('button[class="btn mx-button mx-name-microflowTrigger25 btn-success"]', page);
        await delay(standardDelayAfterFunction);
        await clickOkOnPopupDialog(longProcesTimeout, page);
        packageUploaded = true;
    } 
    return packageUploaded;
}

async function deploy(env ,standardDelayAfterFunction, standardDelayAfterPageLoad, longProcesTimeout ,page) {
    console.log('trying to select the '+env+' envionment...');
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
            return listitem
        }, env);
        
        // wait sothat the button class is set to enabled (default app behaviour after selecting an environment) else it will try to click the disables one.  
        await delay(standardDelayAfterFunction);
        // get button for listitem after button class has changed to enabled = true. 
        await page.evaluate((listitem) =>{
            listitem.getElementsByTagName('button')[0].click();   
        }, envListItem);
        await delay(standardDelayAfterFunction);
        // close popup diaglog after moving package
        await clickOkOnPopupDialog(longProcesTimeout ,page);
        await delay(standardDelayAfterPageLoad);
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
            console.log('continuebutton is avaiable. "'+continuebutton+' continueing normal proces...')
            await delay(standardDelayAfterFunction);
            // click continue 
            await clickNext('button[class="btn mx-button mx-name-microflowTrigger18 btn-primary"]', page);
            await delay(standardDelayAfterFunction);
            // restart application.
            console.log('restaring application...');
            await page.waitForSelector('.mx-groupbox-body');
            // for some reason the Id of the startapplication button changes per session. so we get the buttons ID for the innertext. 
            const elementId = await getIdForInnerText('start application', 'button', page);
            await clickNext('button[id="'+elementId+'"', page);
            await page.waitForSelector('a[class="mx-name-tabPage7"]', {timeout: longProcesTimeout});
            await delay(standardDelayAfterFunction);
            await clickOkOnPopupDialog(longProcesTimeout, page);
            console.log('deploy succesfull!');
            
        } else {
            console.log('continueButton not found. Starting alternative process...');
            await page.waitForSelector('span[title="Environments"]');
            await page.evaluate(()=>{
                return document.querySelector('span[title="Environments"]').children[0].click();
            });
            console.log('environments button clicked...');
            await delay(standardDelayAfterPageLoad);
            await page.waitForSelector('.cloud-environment-mode');
            await page.evaluate((env)=> {
                const environments = document.querySelectorAll('.cloud-environment-mode');
                console.info('found environments: '+environments[1].innerText);
                loop1:
                for (let i = 0; i<environments.length; i++) {
                    if (environments[i].innerText.toLowerCase() === env) {
                        const buttons = environments[i].closest('tr').getElementsByTagName('button');
                loop2:
                        for (let r = 0; r < buttons.length; r++) {
                            if (buttons[r].innerText.toLowerCase() === 'details') {
                                buttons[r].click();
                                break loop1;
                            }
                        }       
                    }
                }
            }, env);

            await delay(standardDelayAfterPageLoad);
            console.log('clicked details on '+env+' environment...');
            const restartButton = await getElementForInnerText('restart application', 'button', page);
            await restartButton.click();
            console.log('clicked restartbutton...');
            await clickOkOnPopupDialog(longProcesTimeout, page);
            console.log('deploy succesfull!');
        }
    } catch (err) {
        console.log('something went wrong: '+err);
    }
}




//  *********** CHILD FUNCTIONS ***********

async function selectRow(dvSelector, rowTitle, page) { 
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

async function selectDeployablePackage(page, delaytime) {
    console.log('Trying to select a package to deploy...');
    //wait untill the span element with innertext 'deploy' appears on the first row of the list of packages.
    await page.waitForFunction("document.querySelectorAll('.gv_table')[0].getElementsByClassName('gv_row')[0].getElementsByClassName('gv_cell_Actions')[0].children[0].children[0].children[0].innerText == 'Deploy'", 
                                {timeout: longProcesTimeout});
    await delay(delaytime);
    await page.evaluate(() => {
        const deploybutton = document.querySelectorAll('.gv_table')[0].getElementsByClassName('gv_row')[0].getElementsByClassName('gv_cell_Actions')[0].children[0].children[0].children[0];
        deploybutton.click();
    });                    
}

// if one of the versionnumbers is empty then set them all to 1. if they are alreadt
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

async function clickOkOnPopupDialog(longProcesTimeout ,page) {
    console.log('trying to click Okay on popup dialog...');
    // this element does not yet exist. first wat for the real page to load
    await page.waitForSelector('.mx-dialog-footer', {timeout: longProcesTimeout});
    //await page.waitForFunction("document.getElementsByClassName('modal-footer mx-dialog-footer')[0].getElementsByTagName('button')[0].innerText == 'Okay'"), {timeout: longProcesTimeout};
    console.log('dialog footer found...');
    await page.evaluate(() => {
        document.getElementsByClassName('modal-footer mx-dialog-footer')[0].getElementsByTagName('button')[0].click();
    });
    console.log('dialog message appeard and clicked "Okay"...');
}

async function getIdForInnerText(innertext, tagname, page) {
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
}

async function getElementForInnerText(innertext, tagname, page) {
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

async function clickNext(selector, page) {
    await page.waitForSelector(selector);
    await page.click(selector);
    console.log('clicked next page...');
}

async function shutdown(page, browser) {
    console.log('Deploybot shutting down...');
    await page.close();
    await browser.close();
}

async function clickOnEnvironments(envElement, page) {
    const anchorTagHtml = await page.evaluate((env)=> { 
        return env.children[0].innerHTML;
    }, envElement);
    console.log('Navigating to Environments page...');
    let envLink = anchorTagHtml.split("\"")[1].split("\"")[0];
    console.log('envUrl: '+envLink );
    await page.goto(envLink, {waitUntil: 'networkidle2'} );
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}






