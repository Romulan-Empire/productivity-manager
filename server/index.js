require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const partials = require('express-partials');
const app = express();
const port = process.env.PORT || 3000;

const auth = require('./utils/auth.js');
const db = require('./database/index.js');
const scrapeDb = require('./database/scraper.js');
const { classifier } = require('./learn/naiveBayes.js');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './splash-client/dist')));

app.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(`Access-Control-Allow-Headers`, `Origin, X-Requested-With, Content-Type, Accept, Authorization`);
  next();
});

const admin = require('firebase-admin');
const { firebaseServiceAccount } = require('./utils/firebase.js');

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

app.post('/session', (req, res) => {
  const idToken = req.body.idToken.toString();
  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;
      const token = auth.createToken(uid);
      res.send({uid, token})
    })
    .catch((error) => {
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});

app.get('/api/classifications', auth.checkJWT, async (req, res) => {
  const {user_name, app_name, window_title} = req.query;

  try {
    const prod_class = await db.getProductivityClass(app_name, window_title, user_name);
    if (prod_class === null && db.appIsBrowser(app_name)) { 
      const predictedProdClass = classifier.predictProductivityClass(window_title, user_name)
      res.send({
        source: predictedProdClass ? 'ml' : 'user',
        class: predictedProdClass
      });
    } else {
      res.send({
        source: 'user',
        class: prod_class
      });
    }
  } catch(e) {
    res.send({
      source: 'user',
      class: null
    })
  }
});

app.post('/api/classifications', auth.checkJWT, async (req, res) => {
  try {
    const result = await db.addOrChangeProductivity(req.body.params);
    const { queryResult, window_title, app_name, prod_class } = result;
    res.send(queryResult);

    // update machine learning after sending the result back to the user
    if (db.appIsBrowser(app_name)) {
      classifier.learnProductivityClass(window_title, prod_class);
      // unclearn the old productivity class if this was a recategorization
      if (result.old_prod_class) {
        classifier.learnProductivityClass(window_title, prod_class);
      }
    }

    // update machine learning log to keep track of accuracy
    if (req.body.params.ml === 'affirm') {
      db.updateMachineLearningLog('affirm');
    } else if (req.body.params.wasML) {
      db.updateMachineLearningLog('reject');
    }
  } catch(e) {
    console.error(e)
    res.send('');
  }
});

app.delete('/api/classifications', auth.checkJWT, async (req, res) => {
  const result = await db.deleteProductivityClass(req.body);
  
  try {
    const { queryResult, window_title, app_name, prod_class } = result;
    res.send(queryResult);
    if (queryResult.rowCount > 0 && db.appIsBrowser(app_name)) { 
      classifier.unlearnProductivityClass(window_title, prod_class);
    }
  } catch(e) {
    console.error(e)
    res.send('');
  }
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});