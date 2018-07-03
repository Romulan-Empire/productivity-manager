const url = require('url');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const moment = require('moment');
const momentFormat = require("moment-duration-format");
const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage, session } = electron;

const { saveStoreToSql, populateStore } = require('./helpers/sqlHelpers.js')
const { monitor } = require('./helpers/activityData.js');
const { manageCookies, manageToken } = require('./helpers/manageSession.js');

let mainWindow, popUpWindow, tray, splash;
let force_quit = false;

const createTray = () => {
  let image = nativeImage.createFromPath(path.join(__dirname, '../leaf.png'))
  tray = new Tray(image);
  tray.setToolTip('Thyme.ly');
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  })
}

const createWindow = () => {
  let winState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 900
  })

  splash = new BrowserWindow({
    width: 150, 
    height: 150, 
    transparent: true,
    frame: false, 
    alwaysOnTop: true
  });

  splash.loadURL(url.format({ 
    pathname: path.join(__dirname, '/../react-client/dist/splash.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow = new BrowserWindow({
      width: winState.width,
      height: winState.height,
      x: winState.x,
      y: winState.y,
      minWidth: 400,
      minHeight: 300,
      show: false
  });

  popUpWindow = new BrowserWindow({
    width: 450,
    height: 450,
    show: false,
    alwaysOnTop: true
  })

  popUpWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/../react-client/dist/idle.html'),
    protocol: 'file',
    slashes: true
  }))

  popUpWindow.on('close', function (event) {
    popUpWindow.hide();
    event.preventDefault();
  })

  let mainSession = mainWindow.webContents.session;
  manageCookies(mainSession, mainWindow);

  winState.manage(mainWindow);

  mainWindow.loadURL(url.format({ 
    pathname: path.join(__dirname, '/../react-client/dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.once('ready-to-show', () => {
    splash.destroy();
    mainWindow.show();
    populateStore(mainWindow);
  })

  mainWindow.on('close', function(e){
    if (!force_quit) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  app.once('before-quit', function() {
    saveStoreToSql(mainWindow)
    
    setTimeout(() => {
      
      force_quit = true;
      popUpWindow.destroy();
      app.quit()
    }, 600)
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
  monitor(mainWindow, mainSession)

  manageToken(mainSession, mainWindow);
}

app.on('ready', () => {
  createWindow();
  createTray();

  let idleStart, idleEnd, duration;
  electron.powerMonitor.on('suspend', () => {
    idleStart = moment()
    popUpWindow.webContents.send('gone-to-idle', 'sleep')
    mainWindow.webContents.send('system', 'sleep')
  });

  electron.powerMonitor.on('resume', () => {
    if(idleStart){
      idleEnd = moment()
      duration = idleEnd.diff(idleStart, "s")
      popUpWindow.webContents.send('wake-from-idle', {
        idleStart: idleStart.format('MMMM Do YYYY, h:mm:ss a'),
        idleEnd: moment().format('MMMM Do YYYY, h:mm:ss a'),
        duration: duration
      })
    }
    popUpWindow.show();
    mainWindow.webContents.send('system', 'resume')
  });
});

app.on('activate', () => { 
  mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
});

ipcMain.on('got-idle-activity', (event, message) => {
  mainWindow.webContents.send('add-idle-activity', message)
  popUpWindow.hide()
})

function logoutAndQuit (mainSession) {
  mainSession.clearStorageData();
  app.quit();
}

const mainMenuTemplate = [
  {
    label: 'File', 
    submenu: [ 
      {
        label: 'Hide/Show', 
        accelerator: process.platform === 'darwin' ? 'Command+W' : 'Ctrl+W',
        click(){
          mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  }
]

if (process.platform === 'darwin'){
  mainMenuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        role: 'toggledevtools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
      },
      {
        role: 'reload'
      }, {
        role: 'togglefullscreen'
      }
    ]
  })
}

exports.logoutAndQuit = logoutAndQuit;