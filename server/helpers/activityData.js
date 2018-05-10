//file to get sample data chunks
const activeWin = require('active-win');
const moment = require('moment');

//closure variables to store activities and errors


//monitor function that runs on interval
// const monitorActivity = async (activities, errors) => {
//   try {
//     let newActivity = assembleActivity(await activeWin());
//     let lastActivity = activities[activities.length - 1];
//     if (needToInitializeChunk(lastActivity)) activities.push(newActivity);
//     else if (chunkComplete(lastActivity, newActivity)) {
//       lastActivity.endTime = timestamp();
//       activities.push(newActivity);
//       return newActivity;
//     }
//   } catch(e) {
//     e.time = timestamp();
//     e.description = e.message;
//     errors.push(e); //TODO: this loses some info but full error objects apparently can't be stored in an array
//   }
// };

const monitorActivity = (activities, errors) => {
  // console.log('in monitor activity')
  return activeWin()
  .then((data) => {
    let newActivity = assembleActivity(data);
    let lastActivity = activities[activities.length - 1];
    if (needToInitializeChunk(lastActivity)) activities.push(newActivity);
    else if (chunkComplete(lastActivity, newActivity)) {
      lastActivity.endTime = timestamp();
      activities.push(newActivity);
      return newActivity;
    }
  })
  .catch((e) => {
    e.time = timestamp();
    e.description = e.message;
    errors.push(e); //TODO: this loses some info but full error objects apparently can't be stored in an array
  })
};

const timestamp = () => {
  return moment().format('MMMM Do YYYY, h:mm:ss a');
};

const assembleActivity = (activeWinObj) => {
  return {
    id: activeWinObj.id,
    app: activeWinObj.owner.name,
    title: activeWinObj.title,
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

exports.monitor = (mainWindow) => {
  let activities = [];
  let errors = [];
  setInterval(() => {
    monitorActivity(activities, errors)
    .then((data) => {
      // console.log('getting data in monitor',data)
      if(data){
        console.log('getting data in monitor', data)
        mainWindow.webContents.send('ping', data)
      }
    })
  }, 1000)
};

/*
ideas for tests:
make sure chunks are properly assembled by making sure it's not making a new chunk every second
make sure entire time period is covered by chunks
*/