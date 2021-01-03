// import globalvariables and genericfunctions to support this function.
const gv = require('../globalvariables.json');
const gf = require('./genericfunctions.js');

module.exports = async (surroundingELement, page) => {
    try {
        const startbutton = await gf.getElementForInnerTextAndParent('start', 'button', surroundingELement, page);
        await startbutton.click();
        console.log('Clicked "Start" (preparing download, could take a minute)...');

        await page.waitForFunction(() => {
            const popupDialog = document.querySelector('.mx-window-content');
            let spans = popupDialog.getElementsByTagName('span');
            spans = Array.from(spans);
            const span = spans.find(el => el.innerText === 'Your backup is ready for download');
            if (typeof span !== 'undefined') {
                return true;
            }
        }, {timeout: gv.longProcesTimeout});

        console.log('downloadbutton selectable');
        const dlbId = await gf.getIdForInnerTextAndParent('download', 'button', surroundingELement, page);
        await gf.clickNext('#'+dlbId, page);
        console.log('Download Started...');
        return true;
    } catch (err) {
        console.log('Something went wrong: '+err);
        return false;
    }
}