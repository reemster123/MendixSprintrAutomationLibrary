// this file gets the downloaded file from the downloads folder and logs it in the terminal (or cmd)

const fs = require('fs');
const util = require('util');
const gf = require('./genericfunctions.js');
const gv = require('../globalvariables.json');
const downloadFolder = require('downloads-folder');
const dlf = formatDirPath(downloadFolder());
// promisify the fs methods. sothat we can await until the value is returned.
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);

module.exports = async function(startsWith, regex, procesTimeout, logcontent) {
    console.log('checking for file in '+dlf+'...');
    const filename = await promiseFileName(procesTimeout);
    async function promiseFileName(timeout) {
        // wait for the filename to appear in the downloadsfolder.
        console.log('Waiting for download to finish...');
        let dbName;
        let starttime = 0; 
        do {
            await gf.delay(gv.standardDelayAfterPageLoad);
            const files = await readdir(dlf);
            dbName = files.find(f => (f.startsWith(startsWith) && f.match(regex)));
            starttime += gv.standardDelayAfterPageLoad;
            if (starttime >= timeout) {
                console.log('promiseFileName times out, breaking loop');
                dbName = null;
                break;
            } 
        } while (typeof dbName === 'undefined');
        return dbName;
    }

    if (typeof filename !== null) {
        const pathToFile = dlf +'/'+filename;
        if (logcontent) {
            const contents = await readfile(pathToFile, 'utf8');
            console.log(contents);
        }
        console.log('file location: '+pathToFile);
        return pathToFile;
    }
    return null;
}

function formatDirPath(dirpath) {
    // parse the downloadsfolder sothat it has a forwardslash instead of (default) backslash.
    return dirpath.split('\\').join('/');

}
