const chalk = require('chalk');
const { Pool, Client } = require('pg');
const moment = require('moment');
const { user, host, database, password, port } = require('../config.js');

//TODO: helper functions that take in queryStr and values, add multiple browser support

//Create connection to AWS database

const pool = new Pool({
  user,
  host,
  database,
  password,
  port
});

const client = new Client({
  user,
  host,
  database,
  password,
  port
});

//----Activity Helper Functions----

const getActivities = () => {
  let query = `SELECT * FROM public.activities;`;
  pool.query(query)
    .then((data) => {
      console.log(chalk.black.bgYellow(JSON.stringify(data.rows)))
    })
    .catch((err) => console.log( chalk.red.bgYellow(err)));
};

const getProductivityClass = async (appName, title, userName) => {
  const queryStr = (appName === 'Google Chrome' ? //refactor to not hardcode
                   `SELECT prod_class FROM public.categories where\
                   (app_name = $1) AND (user_name = $2) AND (window_title = $3)` :
                   `SELECT prod_class FROM public.categories where\
                   (app_name = $1) AND (user_name = $2)`);
  const values = (appName === 'Google Chrome' ? [appName, userName, title] : [appName, userName]);
  try {
    const queryResult = await pool.query(queryStr, values);
    if (queryResult.rows.length) return queryResult.rows[0].prod_class;
    else return null;
  } catch (e) {
    console.error('error in looking up prod_class', e)
    return null;
  }
};

const addOrChangeProductivity = async (query) => {
  const { app_name, window_title, user_name, isTracked } = query;
  try {
    const savedProdClass = await getProductivityClass(app_name, window_title, user_name);
    if (savedProdClass) {
      // console.log('going to change prod!')
      return await changeProductivityClass(query);
    } else {
      // console.log('going to add prod!')
      return await addProductivityClass(query);
    }
  } catch(e) {
    console.error('error checking for productivity!', e);
    // return null;
  }
};

const deleteProductivityClass = async ({user_name, app_name, window_title, prod_class, isTracked}) => {
  let queryStr;
  if (isTracked) {
    queryStr = `DELETE FROM public.categories WHERE user_name='${user_name}' AND app_name='${app_name}' AND window_title='${window_title}'`;
  } else {
    queryStr = `DELETE FROM public.categories WHERE user_name='${user_name}' AND app_name='${app_name}'`;
  }
  const values = [user_name, app_name, window_title, prod_class, isTracked];
  try {
    const queryResult = await pool.query(queryStr);
    return {queryResult, app_name, window_title, prod_class};
  } catch (e) {
    console.error('error in deleting prod-class', e)
  }
}

const addProductivityClass = async ({user_name, app_name, window_title, prod_class}) => {
  const queryStr = app_name === 'Google Chrome' ?
                                `INSERT INTO public.categories(user_name, app_name, window_title, prod_class)\
                                VALUES ($1, $2, $3, $4)` : 
                                `INSERT INTO public.categories(user_name, app_name, prod_class)\
                                VALUES ($1, $2, $3)`;
  const values = (app_name === 'Google Chrome' ?
                              [user_name, app_name, window_title, prod_class]:
                              [user_name, app_name, prod_class]);
  try {
    // console.log('adding prod class')
    const queryResult = await pool.query(queryStr, values);
    return {queryResult, app_name, window_title, prod_class};
  } catch (e) {
    console.error('error in adding prod_class', e)
  }
};

const changeProductivityClass = async ({user_name, app_name, window_title, prod_class, old_prod_class}) => {
  const queryStr = app_name === 'Google Chrome' ?
                               `UPDATE public.categories SET prod_class = $1\
                                WHERE app_name = $2 AND window_title = $3` :
                               `UPDATE public.categories SET prod_class = $1\
                                WHERE app_name = $2`;
  const values = (app_name === 'Google Chrome' ?
                              [prod_class, app_name, window_title]:
                              [prod_class, app_name]);
  try {
    const queryResult = await pool.query(queryStr, values);
    // console.log('trying to change prod class')
    return {queryResult, app_name, window_title, prod_class, old_prod_class};
  } catch (e) {
    console.error('error in changing prod_class', e)
  }
};

const getBrowserActivities = () => {
  //expand to other browsers!
  const queryStr = `select app_name, window_title, prod_class from public.categories where app_name = 'Google Chrome'`;
  return pool.query(queryStr)
    .then(data => data.rows)
    .catch(err => console.error('error getting all browser titles', err))
};

const updateMachineLearningLog = async (action) => {
  const queryStr = `insert into public.machine_learning_log(timestamp, action) values($1, $2)`;
  const value = [moment().format(), action];
  try {
    const queryResult = await pool.query(queryStr, value);
  } catch(e) {
    console.log('error trying to update ML log', e);
  }
};

const insertActivity = () => {
  let query = 
  `INSERT INTO public.activities
    VALUES ('1999-01-08 04:05:06', '1999-01-08 04:05:06', 'chrome', 'reddit', 'abc', 'xyz', 'www.random.com');`;

    pool.query(query)
    .then((data) => console.log( chalk.black.bgGreen(JSON.stringify(data))) )
    .catch((err) => console.log( chalk.red.bgGreen(err)));
}

const updateActivity = (activity_id, newCategory) => {
  let query = 
  `UPDATE public.activities
	SET category='${newCategory}'
  WHERE activity_id='${activity_id};`
  
  pool.query(query)
  .then((data) => console.log( chalk.black.bgBlue(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgBlue(err)));

}

const deleteActivity = () => {
  let query = 
  `DELETE FROM public.activities'
  WHERE app_name='chrome';`
  
  pool.query(query)
  .then((data) => console.log( chalk.black.bgRed(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgRed(err)));
}


//----Users Helper Functions----

const getUsers = () => {
  let query = `SELECT * FROM public.users;`;

  pool.query(query)
  .then((data) => console.log( chalk.black.bgYellow(JSON.stringify(data))))
  .catch((err) => console.log( chalk.red.bgYellow(err)));
} 

const insertUser = () => {
  let query = 
  `INSERT INTO public.users(
    username, hash, user_id)
    VALUES ('johndoe1', null, '2');`;

  pool.query(query)
  .then((data) => console.log( chalk.black.bgGreen(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgGreen(err)));
}

const updateUser = () => {
  let query = 
  `UPDATE public.users
	SET username='janedoe1'
	WHERE username='johndoe1';`;

  pool.query(query)
  .then((data) => console.log( chalk.black.bgBlue(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgBlue(err)));

}

const deleteUser = () => {
  let query = 
  `DELETE FROM public.users
	WHERE username='janedoe1';`;

  pool.query(query)
  .then((data) => console.log( chalk.white.bgRed(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgRed(err)) );
}

//----User Metrics Helper Functions----

/*

To be filled out later

*/

//----Pomodoro Preferences Helper Functions----

/*

To be filled out later

*/


//----Errors Helper Functions----

const getErrors = () => {
  let query = 
  `SELECT * FROM public.errors;`

  pool.query(query)
  .then((data) => console.log( chalk.black.bgYellow(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgYellow(err)));

}

const insertError = () => {
  let query = 
  `INSERT INTO public.errors(error_msg)
  VALUES ('this is a sample message');`
  
  pool.query(query)
  .then((data) => console.log( chalk.black.bgGreen(JSON.stringify(data))) )
  .catch((err) => console.log( chalk.red.bgGreen(err)));

}

exports.getActivities = getActivities;
exports.getProductivityClass = getProductivityClass;
exports.deleteProductivityClass = deleteProductivityClass;
exports.addOrChangeProductivity = addOrChangeProductivity;
exports.getBrowserActivities = getBrowserActivities;
exports.pool = pool;
exports.updateMachineLearningLog = updateMachineLearningLog
// insertActivity();
// getActivities();

//close the connection
// pool.end();




