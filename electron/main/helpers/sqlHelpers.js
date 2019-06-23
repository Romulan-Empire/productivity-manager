const { createTables, insertActivities, insertPreferences, getActivities, insertSpurts,
        getSpurts, clearDb, closeDb } = require('../../database/sqlite.js');
const { ipcMain } = require('electron');

const populateStore = (mainWindow) => {
  let trackedApps = ['Google Chrome', 'Chromium-browser', 'Firefox', 'Safari', 'Idle']; //change to get prefs from db
  let newActivities;
  createTables()
    .then(() => {
      return getActivities();
    })
    .then((activities) => {
      newActivities = activities.map(activityObj => {
        const mappedAct = {
          ...activityObj,
          productivity: {
            source: activityObj.source,
            class: activityObj.productivity
          }
        }
        const { source, ...noSource } = mappedAct;
        return noSource;
      });
      return getSpurts()
    })
    .then((spurts) => {
      spurts.forEach((spurt) => {
        let isTracked = trackedApps.includes(spurt.app);
        for (let activity of newActivities) {
          let query = isTracked ? 
                    spurt.title === activity.title && spurt.app === activity.app : 
                    spurt.app === activity.app

          if (query) {
            activity.spurts = activity.spurts || []
            activity.spurts.push({
              startTime: spurt.startTime,
              endTime: spurt.endTime
            })
          }
        }
      })
      mainWindow.send('sqlActivities', newActivities)
    })
    .catch((err) => console.error('error populating store from local db:', err))
}

const saveStoreToSql = (mainWindow) => {
  clearDb()
  .then((data) => {
    mainWindow.send("windowClose", "close")
    ipcMain.once("store", (event, data) => {
      let { activities, preferences } = JSON.parse(data);
      for (let category in activities) {
        if (category !== 'nextId') {
          activities[category].forEach((el) => {
            el.spurts.forEach((spurt) => {
              insertSpurts(el, spurt);
            })
            insertActivities(el);
          })
        }
      }
  
      for (let category in preferences) {
        preferences[category].forEach((el) => (insertPreferences(el, category)))
      }
    })
    
  })
  .catch((err) => console.log('ERR IN CLEARING DB', err))
}


exports.populateStore = populateStore;
exports.saveStoreToSql = saveStoreToSql;