const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'sqlite.db')
const db = new sqlite3.Database(dbPath);
const Promise = require('bluebird')
const moment = require('moment')
let date = moment().format('YYYY-MM-DD')

const promisifyQuery = (queryStr, params) => {
  if (params) {
    return new Promise((resolve, reject) => {
      db.run(queryStr, params, (err, result) => {
        if (err) reject(err);
        else resolve(result)
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      db.run(queryStr, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
};

const createTables = () => {
  const activitiesTable = promisifyQuery("CREATE TABLE IF NOT EXISTS activities (id INT, date DATE, productivity TEXT, source TEXT, app TEXT, title TEXT, duration INT, toShow INT)");
  const prefsTable = promisifyQuery("CREATE TABLE IF NOT EXISTS preferences (category TEXT, data TEXT)")
  const spurtsTable = promisifyQuery("CREATE TABLE IF NOT EXISTS spurts (id INT, date DATE, productivity TEXT, app TEXT, title TEXT, startTime TEXT, endTime TEXT)")
  return Promise.all([activitiesTable, prefsTable, spurtsTable]);
};

const insertActivities = ({ id, productivity, app, title, duration, toShow }) => {
  if (typeof productivity !== 'object') console.log(`productivity for ${app} and ${title} was not an object!`)
  const query = `INSERT INTO activities(id, date, productivity, source, app, title, duration, toShow) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, date, productivity.class, productivity.source, app, title, duration, toShow];
  return promisifyQuery(query, params);
}

const insertPreferences = (data, category) => {
  const query = `INSERT INTO preferences(data, category) VALUES(?, ?)`;
  const params = [data, category];
  return promisifyQuery(query, params);
}

//NEED TO ADD DATE
const insertSpurts = ({id, productivity, app, title}, {startTime, endTime}) => {
  const query = `INSERT INTO spurts(id, date, productivity, app, title, startTime, endTime) VALUES(?, ?, ?, ?, ?, ?, ?)`;
  const params = [id, date, productivity.class, app, title, startTime, endTime];
  return promisifyQuery(query, params);
}

const getActivities = () => {
  // let query = `SELECT id, date, productivity, source, app, title, duration FROM activities WHERE date=date(${date})`;
  const query = `SELECT id, date, productivity, source, app, title, duration, toShow FROM activities`
  return new Promise ((resolve, reject) => {
    db.all(query, [], (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
  return promisifyQuery(query)
}

const getSpurts = (cb) => {
  // let query = `SELECT id, date, productivity, app, title, startTime, endTime FROM spurts WHERE date=date(${date})`;
  let query = `SELECT id, date, productivity, app, title, startTime, endTime FROM spurts`
  return new Promise ((resolve, reject) => {
    db.all(query, [], (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

const clearDb = () => {
  // let querys = [`DELETE FROM activities WHERE date=${date}`, `DELETE FROM preferences`, `DELETE FROM spurts WHERE date=${date}`]
  const queries = [`DELETE FROM activities`, `DELETE FROM preferences`, `DELETE FROM spurts`]
  // return Promise.map(querys, (query) => {
  //   return db.run(query)
  // })
  const clearPromises = queries.map(query => promisifyQuery(query));
  return Promise.all(clearPromises)
    .catch(e => {console.log(e)}) //probably throwing an error if the tables don't exist, which is fine 
}

const closeDb = () => {
  db.close();
};

exports.createTables = createTables;
exports.insertActivities = insertActivities;
exports.insertPreferences = insertPreferences;
exports.insertSpurts = insertSpurts;
exports.getSpurts = getSpurts;
exports.getActivities = getActivities;
exports.clearDb = clearDb;
exports.closeDb = closeDb;