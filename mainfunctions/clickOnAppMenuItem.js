module.exports = async function(menuGrpClass, index, page) {
    const subMenuGrp = await page.waitForSelector(menuGrpClass);
    console.log('submenugroup found');
    const link = await page.evaluate((grp, i) => grp.querySelectorAll('a')[i].getAttribute('href') ,subMenuGrp, index);
    console.log('link found: '+link);
    await page.goto(link, {waitUntil: 'networkidle2'} );
    console.log('went to link');
    
}
