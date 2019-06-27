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

// TODO: Rename to withLog and have a second param for the variables to log
const withCatch = async (fn) => {
  try {
    return await fn();
  } catch(e) {
    // sentry log if in prod?
    console.error('db error', e);
  }
};

class Store {
  constructor(connection) {
    // connection is an intialized PG client or pool
    this.pg = connection;
    this.browserApps = ['Google Chrome', 'Chromium-browser']; // TODO: replace with user tracked settings
  }

  appIsBrowser(appName) {
    return this.browserApps.includes(appName);
  }

  async getProductivityClass(appName, title, userName) {
    const queryStr = this.appIsBrowser(appName) ?
        `SELECT prod_class FROM public.categories where (app_name = $1) AND (user_name = $2) AND (window_title = $3)` :
        `SELECT prod_class FROM public.categories where (app_name = $1) AND (user_name = $2)`;
    const values = this.appIsBrowser(appName) ? [appName, userName, title] : [appName, userName];

    return withCatch(async () => {
      const queryResult = await this.pg.query(queryStr, values);
      if (queryResult.rows.length) return queryResult.rows[0].prod_class;
      else return null;
    });
  }

  async addProductivityClass({user_name, app_name, window_title, prod_class}) {
    const queryStr = this.appIsBrowser(app_name) ?
      `INSERT INTO public.categories(user_name, app_name, window_title, prod_class) VALUES ($1, $2, $3, $4)` : 
      `INSERT INTO public.categories(user_name, app_name, prod_class) VALUES ($1, $2, $3)`;
    const values = this.appIsBrowser(app_name) ?
      [user_name, app_name, window_title, prod_class] :
      [user_name, app_name, prod_class];

    return withCatch(async () => {
      const queryResult = await this.pg.query(queryStr, values);
      return {queryResult, app_name, window_title, prod_class};
    })
  }

  // TODO: Get rid of unused params like old_prod_class
  async changeProductivityClass({user_name, app_name, window_title, prod_class, old_prod_class}) {
    const queryStr = this.appIsBrowser(app_name) ?
        `UPDATE public.categories SET prod_class = $1 WHERE app_name = $2 AND window_title = $3` :
        `UPDATE public.categories SET prod_class = $1 WHERE app_name = $2`;
    const values = this.appIsBrowser(app_name) ? [prod_class, app_name, window_title] : [prod_class, app_name];

    return withCatch(async () => {
      const queryResult = await this.pg.query(queryStr, values);
      return {queryResult, app_name, window_title, prod_class, old_prod_class};
    });
  }

  async addOrChangeProductivity(query) {
    const { app_name, window_title, user_name, isTracked } = query;

    return withCatch(async () => {
      const savedProdClass = await this.getProductivityClass(app_name, window_title, user_name);
      savedProdClass ? await this.changeProductivityClass(query) : await this.addProductivityClass(query);
    });
  }

  async deleteProductivityClass({user_name, app_name, window_title, prod_class, isTracked}) {
    const queryStr = isTracked ? 
     `DELETE FROM public.categories WHERE user_name = $1 AND app_name = $2 AND window_title = $3` :
     `DELETE FROM public.categories WHERE user_name = $1 AND app_name = $2`;
    const values = isTracked ? [user_name, app_name, window_title] : [user_name, app_name];

    return withCatch(async () => {
      const queryResult = await this.pg.query(queryStr, values);
      return {queryResult, app_name, window_title, prod_class};
    });
  }

  async getBrowserActivities() {
    // TODO: Programtically assemble this queryStr
    const queryStr = `select app_name, window_title, prod_class from public.categories where app_name = 'Google Chrome' or app_name = 'Chromium-browswer'`;
    return withCatch(async () => {
      const queryResult = await this.pg.query(queryStr);
      return queryResult.rows;
    })
  }

  async updateMachineLearningLog(action) {
    const queryStr = `insert into public.machine_learning_log(timestamp, action) values($1, $2)`;
    const values = [moment().format(), action];

    return withCatch(async () => {
      await this.pg.query(queryStr, value);
    })
  }
}

// for testing
exports.Store = Store;

// for use in rest of app
const s = new Store(pool);

// temporary way to keep the exports of this file the same as before
exports.getProductivityClass = s.getProductivityClass.bind(s);
exports.deleteProductivityClass = s.deleteProductivityClass.bind(s);
exports.addOrChangeProductivity = s.addOrChangeProductivity.bind(s);
exports.getBrowserActivities = s.getBrowserActivities.bind(s);
exports.updateMachineLearningLog = s.updateMachineLearningLog.bind(s);
