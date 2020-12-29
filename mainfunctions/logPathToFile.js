// this file gets the downloaded logfile from the downloads folder and logs it in the terminal (or cmd)

const fs = require('fs');
const util = require('util');
const downloadFolder = require('downloads-folder');
const dlf = formatDirPath(downloadFolder());
// promisify the fs methods. sothat we can await until the value is returned.
const readdir = util.promisify(fs.readdir);
const readfile = util.promisify(fs.readFile);

module.exports = async function(startsWith, regex) {
    console.log('checking for logfile in '+dlf+'...');
    const files = await readdir(dlf);
    const filename = files.find(f => (f.startsWith(startsWith) && f.includes(regex)));
    if (typeof filename !== 'undefined') {
        const pathToFile = dlf +'/'+filename
        const contents = await readfile(pathToFile, 'utf8');
        console.log(contents);
        console.log('file location: '+pathToFile);
        return true;
    } else {
        console.log('file not found...');
        return false;
    }
}

function formatDirPath(dirpath) {
    // parse the downloadsfolder sothat it has a forwardslash instead of (default) backslash.
    return dirpath.split('\\').join('/');

}
