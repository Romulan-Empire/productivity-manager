const bayes = require('classificator');
const classifier = bayes();
const { getBrowserActivities } = require('../database/index.js');

//get all app_name, window_title, and prod_class from public.categories where app_name is 'Google Chrome'
//for each of these rows, classifier.learn(window_title, prod_class)
//try making classifier.categorize and console.log likely categories when the DB is queried for a category!
//find a way to periodically save its .toJson() state! (either in SQL or firebase)

//TODO: save classifier into DB so it can be "revived" each time
getBrowserActivities()
  .then((activities) => {
    console.log('browser activities are', activities);
    activities.forEach(({window_title, prod_class}) => {
      classifier.learn(window_title, prod_class);
    });

    console.log(`classification of The Time Has Come for a Better Breast Pump`)
    console.log(classifier.categorize('The Time Has Come for a Better Breast Pump'))
    console.log(`classification of React JS Crash Course - YouTube`)
    console.log(classifier.categorize('React JS Crash Course - YouTube'))
    console.log(`classification of 'store json in firebase database'`)
    console.log(classifier.categorize('store json in firebase database'))
    console.log(`classification of 'The Story of Metal Gear Solid in 7 Minutes - Youtube'`)
    console.log(classifier.categorize('The Story of Metal Gear Solid in 7 Minutes - Youtube'))
    console.log(`classification of 'mysql - Storing JSON in databse vs. having a new column for each key - Stack Overflow'`)
    console.log(classifier.categorize('mysql - Storing JSON in databse vs. having a new column for each key - Stack Overflow'))
  })
  .catch((err) => {
    console.error('error in trying to run naive-bayes', err)
  });
