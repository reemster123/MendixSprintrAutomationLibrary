// for the browser create a page with viewport and useragent

module.exports = async function(browser) {
    const page = await browser.newPage();
    await page.setViewport ({
        width: 1600,
        height: 600
    });
    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");
    return page;

}