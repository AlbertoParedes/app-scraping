/* eslint-disable no-undef */
/* eslint-disable no-loop-func */


module.exports = {
  run: function(mainWindow, data) {

    /* eslint-disable no-undef */
    /* eslint-disable no-loop-func */
    const puppeteer = require('puppeteer');


    async function getPic() {
      const browser = await puppeteer.launch({headless: false});
      const page = await browser.newPage();
      await page.goto('https://www.google.es/search?num=100&q=posiciionamiento+se&nfpr=1&sa=X&ved=0ahUKEwic16uf6OfjAhVJU30KHQsZBQcQvgUIMigB');
      //await page.setViewport({width: 1000, height: 500})
      var img = await page.screenshot({encoding: 'binary',  fullPage: true});

      console.log(img);
      
      

      await browser.close();
    }

    getPic();




  },

  stop: function() {
  }
}

