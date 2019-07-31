const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const ahrefs = require('./conectores_python/ahrefs');
const word2html = require('./conectores_python/word2html');
const prensrank = require('./nightmare/prensrank');
const googleTracker = require('./nightmare/googleTracker2');

var os = require("os");
const platforms = {WINDOWS: 'WINDOWS',MAC: 'MAC',LINUX: 'LINUX',SUN: 'SUN',OPENBSD: 'OPENBSD',ANDROID: 'ANDROID',AIX: 'AIX',};
const platformsNames = {win32: platforms.WINDOWS,darwin: platforms.MAC,linux: platforms.LINUX,sunos: platforms.SUN,openbsd: platforms.OPENBSD,android: platforms.ANDROID,aix: platforms.AIX,};
const currentPlatform = platformsNames[os.platform()];

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1150,
    minWidth: 580,
    minHeight: 585,
    height: 800,
    frame: false,
    transparent: false,
    title:"Yoseo",
    titleBarStyle: "customButtonsOnHover",
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);

  mainWindow.on('leave-full-screen', () => {
    mainWindow.send('SHOW_BTNS', true)
  });
  mainWindow.on('enter-full-screen', () => {
    mainWindow.send('SHOW_BTNS', false)
  });
  mainWindow.on('focus', () => {
    mainWindow.send('FOCUS_FRAME', true)
  });
  mainWindow.on('blur', () => {
    mainWindow.send('FOCUS_FRAME', false)
  });

  //windows listeners
  mainWindow.on('move',(e) =>{
    mainWindow.send('FULL_SCREEN', false)
  });
  mainWindow.on('minimize',(e) =>{
    mainWindow.send('FULL_SCREEN', false)
  });
  mainWindow.on('maximize',(e) =>{
    mainWindow.send('FULL_SCREEN', true)
  });

}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});




//Conexion con python AHREFS KEYWORDS
ipcMain.on('START_SCRAPING_KEYWORDS_AHREFS', (event, item) => {
  ahrefs.start(mainWindow,item);
})

//EXTRACT DATA FROM WORDS
ipcMain.on('GET_DATA_WORDS', (event, files) => {
  word2html.start(mainWindow,files);
})
//EXTRACT DATA FROM WORDS
ipcMain.on('SAVE_DATA_WORDS', (event, data) => {
  word2html.saveData(mainWindow,data);
})


//Nightmare get all blogs PRESARANK --------------------------------------------------------------------------
ipcMain.on('START_PRENSARANK', (event, data) => {
  prensrank.run(mainWindow,data);
})
ipcMain.on('STOP_PRENSARANK', (event) => {
  prensrank.stop();
})

//------------------------------------------------------------------------------------------------------------



//Nightmare GOOGLE TRACKER --------------------------------------------------------------------------
ipcMain.on('START_GOOGLE_TRACKER', (event, data) => {
  googleTracker.run(mainWindow,data);
})
ipcMain.on('STOP_GOOGLE_TRACKER', (event) => {
  googleTracker.stop();
})
//------------------------------------------------------------------------------------------------------------





ipcMain.on('OS', (event) => {
  mainWindow.send('OS', currentPlatform)
})