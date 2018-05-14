const chalk = require('chalk');
const { Pool, Client } = require('pg');

//Create connection to AWS database

const pool = new Pool({
  user: 'senior',
  host: 'productivity-app.cmqyrbiaigty.us-east-2.rds.amazonaws.com',
  database: 'postgres',
  password: 'hackreactor',
  port: 5432,
})

const client = new Client({
  user: 'senior',
  host: 'productivity-app.cmqyrbiaigty.us-east-2.rds.amazonaws.com',
  database: 'postgres',
  password: 'hackreactor',
  port: 5432,
})

//----Activity Helper Functions----

const getActivities = () => {
  let query = `SELECT * FROM public.activities;`;
  pool.query(query)
    .then((data) => {
      console.log(chalk.black.bgYellow(JSON.stringify(data.rows)))
    })
    .catch((err) => console.log( chalk.red.bgYellow(err)));
};

const getProductivityClass = (appName, title) => {
  const queryStr = `SELECT prod_class FROM public.categories where\
                    (app_name = $1) AND (window_title = $2)`;
  const values = [appName, title];
  return pool.query(queryStr, values)
    .then((data) => {
      if (data.rows.length) {
        // console.log('productivity class is', data.rows[0].prod_class)
        return data.rows[0].prod_class
      } else {
        // console.log('productivity class not found')
        return null;
      }
    })
    .catch(err => console.error('error in looking up prod_class', err)) 
};

const addOrChangeProductivity = (query) => {
  console.log('inside add or change productivity')
  const {app_name, window_title} = query;
  return getProductivityClass(app_name, window_title) //add user here later
    .then(result => {
      if (result) {
        // console.log('gotta recategorize!')
        return changeProductivityClass(query)
      }
      else {
        // console.log('gotta add productivity!')
        return addProductivityClass(query);
      }
    })
    .catch(err => console.log('error checking for productivity!'))
};

//ADD DELETE FUNCTIONALITY FOR USER

const addProductivityClass = ({user_name, app_name, window_title, prod_class}) => {
  const queryStr = `INSERT INTO public.categories(user_name, app_name, window_title, prod_class)\
                    VALUES ($1, $2, $3, $4)`;
  const values = [user_name, app_name, window_title, prod_class];
  console.log('values to add are', values)
  return pool.query(queryStr, values)
    .catch(err => console.error('error in adding prod_class', err)) 
};

const changeProductivityClass = ({user_name, app_name, window_title, prod_class}) => {
  const queryStr = `UPDATE public.categories SET prod_class = $1\
                    WHERE app_name = $2 AND window_title = $3`;
  const values = [prod_class, app_name, window_title];
  return pool.query(queryStr, values)
    .catch(err => console.error('error in changing prod_class', err)) 
};

const getBrowserActivities = () => {
  //expand to other browsers!
  const queryStr = `select app_name, window_title, prod_class from public.categories where app_name = 'Google Chrome'`;
  return pool.query(queryStr)
    .then(data => data.rows)
    .catch(err => console.error('error getting all browser titles', err))
}

//changeProductivityClass

//getActivitiesbyUser

// const insertActivity = () => {
//   let query = 
//   `INSERT INTO public.activities
//     VALUES ('1999-01-08 04:05:06', '1999-01-08 04:05:06', 'chrome', 'reddit', 'abc', 'xyz', 'www.random.com');`;

//     pool.query(query)
//     .then((data) => console.log( chalk.black.bgGreen(JSON.stringify(data))) )
//     .catch((err) => console.log( chalk.red.bgGreen(err)));
// }

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
exports.addOrChangeProductivity = addOrChangeProductivity;
exports.getBrowserActivities = getBrowserActivities;
// insertActivity();
// getActivities();

//close the connection
// pool.end();




