const bayes = require('classificator');
const moment = require('moment');
const { CronJob } = require('cron');
const { getBrowserActivities } = require('../database/index.js');


class Classifier {
  constructor() {
    this.bayes = bayes();
    this.REQUIRED_CONFIDENCE = 0.9;
    this.init().then(this.setSyncCronJob());
  }

  async init() {
    const activities = await getBrowserActivities();
    try {
      this.bulkLearn(activities);
      console.log('classifier initialized!');
    } catch(e) {
      console.error('error in trying to initilize classifier', e);
    }
  }

  bulkLearn(activities) {
    activities.filter(({ app_name, prod_class }) => app_name === 'Google Chrome' && prod_class !== 'neutral')
              .forEach(({window_title, prod_class}) => {
                this.bayes.learn(window_title, prod_class);
              });
  }

  setSyncCronJob() {
    console.log('setting new cron job')
    new CronJob({
      cronTime: '0 * * * *', //every hour at minute zero
      onTick: () => {
        console.log('syncing classifier to DB at', moment().format('MMMM Do YYYY, h:mm:ss a'))
        this.init()
      },
      start: true,
      timeZone: 'America/New_York'
    })
  }

  predictProductivityClass(title, user_name) {
    const prediction = this.bayes.categorize(title).likelihoods
                                  .filter(cat => cat.proba > this.REQUIRED_CONFIDENCE)
    if (prediction.length) return prediction[0].category;
    else return null;
  }

  learnProductivityClass(title, productivityClass) {
    this.bayes.learn(title, productivityClass);
    console.log(`ml is learning that ${title} is ${productivityClass}`);
  };
  
  unlearnProductivityClass(title, oldProdClass) {
    this.bayes.unlearn(title, oldProdClass);
    console.log(`ml is UNlearning that ${title} was classified ${oldProdClass}`);
  };
}

exports.classifier = new Classifier();