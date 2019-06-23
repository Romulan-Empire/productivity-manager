require('dotenv').config();
const { Pool } = require('pg');
const moment = require('moment');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: true,
});

const getProductivityClass = async (appName, title, userName) => {
  const queryStr = (appName === 'Google Chrome' ?
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
      return await changeProductivityClass(query);
    } else {
      return await addProductivityClass(query);
    }
  } catch(e) {
    console.error('error checking for productivity!', e);
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
    return {queryResult, app_name, window_title, prod_class, old_prod_class};
  } catch (e) {
    console.error('error in changing prod_class', e)
  }
};

const getBrowserActivities = () => {
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

exports.getProductivityClass = getProductivityClass;
exports.deleteProductivityClass = deleteProductivityClass;
exports.addOrChangeProductivity = addOrChangeProductivity;
exports.getBrowserActivities = getBrowserActivities;
exports.pool = pool;
exports.updateMachineLearningLog = updateMachineLearningLog;




