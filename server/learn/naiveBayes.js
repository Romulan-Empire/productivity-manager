const bayes = require('classificator');
const classifier = bayes();
const { getBrowserActivities } = require('../database/index.js');

//get all app_name, window_title, and prod_class from public.categories where app_name is 'Google Chrome'
//for each of these rows, classifier.learn(window_title, prod_class)
//try making classifier.categorize and console.log likely categories when the DB is queried for a category!
//find a way to periodically save its .toJson() state! (either in SQL or firebase)

//TODO: save classifier into DB so it can be "revived" each time
const initClassifier = (activities) => {
  activities.forEach(({window_title, prod_class}) => {
    classifier.learn(window_title, prod_class);
  });
};

getBrowserActivities()
  .then((activities) => {
    initClassifier(activities);
    console.log('classifier initialized!');
  })
  .catch((err) => {
    console.error('error in trying to run naive-bayes', err)
  });

  // learn either periodically using a cron or on every new user categorization
    // if latter, need to also recognize recategorizations and deletes
    
const predictProducitivityClass = (title) => {
  console.log(`predicting productivity class of ${title}`)
  console.log(classifier.categorize(title));
};

exports.predictProducitivityClass = predictProducitivityClass;