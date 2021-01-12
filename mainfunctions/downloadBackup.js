const gf = require('./genericfunctions.js');
const gv = require('../globalvariables.json');

module.exports = async (appName, date, page) => {
    try {
        //login with credentials
        await require('./login.js')(page);
        await gf.delay(gv.standardDelayAfterFunction);

        // navigate from homepage to the environments page for the appName
        const navigationSuccesfull = await require('./navigateToApp.js')(appName, page);
        if (navigationSuccesfull) {
            console.log('We are now on the apps homepage...');
            await gf.delay(gv.standardDelayAfterPageLoad);
            // click on the "backups" menu item.
            await require('./clickOnAppMenuItem')('#formatstring_widget_formatstring_20' , page);
            await gf.delay(gv.standardDelayAfterPageLoad);
            console.log('We are now on the "Backups" page...');
            await gf.selectItemFromDropdown(page);
            await gf.delay(gv.standardDelayAfterPageLoad);
            // select a database for the given date
            const formattedDate = require('./formatDate.js')(date);
            const databaseSelected = await require('./treeviewSelectRow.js')('TreeView_widget_GridView_0', 'gv_cell_CreatedOn', formattedDate, page);
            
            if (databaseSelected) {
                // start download --> click on downloadbackup, select radiobutton, click start, click download. 
                console.log('Database Selected...');
                gf.delay(gv.standardDelayAfterFunction);
                const dlb = await gf.getElementForInnerText('download backup', 'button', page);
                await dlb.click();
                console.log('Clicked "Download Backup"...');
                const popupDialog = await page.waitForSelector('.mx-window-content', {timeout: gv.standardTimeOutWFS});
                const clickedDbOnly = await gf.selectFromRadioButtons( popupDialog, 'input[value="database_only"]', page);

                if (clickedDbOnly) { 
                    console.log('Clicked "Database Only"');
                    await gf.delay(gv.standardDelayAfterFunction);
                    const downloadStarted = await require('./startDbDownload.js')(popupDialog, page);
                    await gf.delay(gv.standardDelayAfterFunction);
                    if (downloadStarted) {
                        // the date in the filetitle is formatted yyyymmdd+'[0-9]{4}' (+ 4 other digits for the time which we don't use)
                        const dateWithoutDashes = date.split('-').join('');
                        const regex = dateWithoutDashes+'[0-9]{4}';
                        // get file location for the regex based on the date and 'database_only' string. Also add a timeout for the downloadtime
                        const url = await require('./logPathToFile.js')('database_only', regex, gv.longProcesTimeout, false);
                        return url;
                    } 
                }
            }
        }
        return null;
    } catch (err) {
        console.log('Something went wrong in DownloadBackup.js: '+err);
        return null;
    }
}
