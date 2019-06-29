//file to get sample data chunks
const activeWin = require('active-win');
const moment = require('moment');
const electron = require('electron');
const { ipcMain, session } = electron;
const axios = require('axios');
const path = require('path');
const url = require('url');

const config = require(path.join(__dirname, '../mainConfig.js'));
const sanitizers = require('./activitySanitizers.js');
const serverURL = process.env.NODE_ENV === 'localhost' ? config.localhost : config.server;
console.log('server url is', serverURL);


const timestamp = () => {
  return moment().format('MMMM Do YYYY, h:mm:ss a');
};

const assembleActivity = (activeWinObj) => {
  const app = activeWinObj.owner.name
  let title = sanitizers.stripEmoji(activeWinObj.title); // filter out the sound playing emoji
  title = (app === 'Google Chrome' || app === 'Chromium-browser') ? sanitizers.sanitizeTitle(title) : title
  return {
    id: activeWinObj.id,
    app,
    title, 
    startTime: timestamp()
  };
};

const needToInitializeChunk = (lastActivity) => {
  return !lastActivity;
};

const chunkComplete = (lastActivity, newActivity) => {
  if (needToInitializeChunk(lastActivity)) return false;
  return (lastActivity.app !== newActivity.app) || (lastActivity.title !== newActivity.title);
};

const monitorActivity = (activities, user, jwt) => {
  return activeWin()
    .then((data) => {
      let newActivity = assembleActivity(data);
      let lastActivity = activities[activities.length - 1];
      if (needToInitializeChunk(lastActivity)) activities.push(newActivity);
      else if (chunkComplete(lastActivity, newActivity)) {
        lastActivity.endTime = timestamp();
        activities.push(newActivity);
        return lastActivity;
      }
    })
    .then((lastActivity) => {
      if (lastActivity) { //only bother if lastActivity not undefined
        const qs = {
          user_name: user,
          app_name: lastActivity.app,
          window_title: lastActivity.title
        };
        const headers = {
          Authorization: `${user} ${jwt}`
        };
        return axios.get(serverURL + '/api/classifications', {headers, params: qs})
          .then((resp) => {
            if (typeof resp.data !== 'object') {
              console.log('received this instead', resp.data)
            }
            return {
              ...lastActivity,
              productivity: resp.data
            };
          })
          .catch((err) => console.log(err))
      }
    })
    .catch((e) => {
      console.log('error in activity monitor is', e)
    })
};

const startMonitor = (mainWindow, activities = [], user, jwt) => {
  return setInterval(() => {
    monitorActivity(activities, user, jwt)
      .then((data) => {
        if (data) {
          mainWindow.sender.webContents.send('activity', data)
        }
      })
      .catch((err) => console.error('error in activity monitor', err))
  }, 1000)
};

//closure variables

let intervalId = false;
let activities = [];
let user = '';
let jwt = '';

exports.monitor = (mainWindow, mainSession) => {
  ipcMain.on('monitor', (mainWindow, event, message) => {
    if (event === 'start') {
      console.log('start message is', message)
      const userObj = JSON.parse(message);
      user = userObj.user;
      jwt = userObj.jwt;
      activities = [];
      intervalId = startMonitor(mainWindow, activities, user, jwt);
    } else if (event === 'pause' && intervalId) {
      clearInterval(intervalId);
      monitorActivity(activities, user, jwt); // ♫ ♬ ONE LAST/MORE TIME ♩ ♬ 
      intervalId = false;
    } else {
      console.error('activity monitor did not understand instruction', event, message);
    }
  });
};

exports.stopMonitorProcess = () => {
  if (intervalId) clearInterval(intervalId);
};

exports.restartMonitorProcess = (mainWindow, mainSession) => {
  intervalId = startMonitor(mainWindow, activities, user, jwt);
};

// exports for unit tests

exports.assembleActivity = assembleActivity;
exports.chunkComplete = chunkComplete;