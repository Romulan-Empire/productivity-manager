const jwt = require('jsonwebtoken');
const secret = require('../config.js').secret;

exports.createToken = (uid) => {
  return jwt.sign({ uid }, secret, {
    expiresIn: 86400 * 7 // expires in 1 week
  });
};

exports.checkJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('NO TOKEN PROVIDED!');

  const userId = authHeader.split(' ')[0];
  const jwtToken = authHeader.split(' ')[1];
  jwt.verify(jwtToken, secret, function(err, decoded) {
    if (err) {
      console.log('error decoding jwt', err);
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
    };
    if (decoded.uid === userId) {
      next();
    } else {
      console.log('decoded token does NOT match uid...unauthorized')
      res.status(401).send('UNAUTHORIZED REQUEST!');
    }
  });
}