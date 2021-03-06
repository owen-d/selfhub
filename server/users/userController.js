var User = require('./userModel');
var bluebird = require('bluebird');
var jwt = require('jsonwebtoken');
var helpers = require('../config/helpers');

bluebird.promisifyAll(User);
var TWO_WEEKS_IN_MINUTES = 60 * 24 * 14;

module.exports = {
  signin: function(request, response, next) {
    var username = request.body.username;
    var password = request.body.password;
    User.model.findOneAsync({username: username})
      .then(function(user) {
        if (user) {
          if (User.validPasswordAsync(password, user.password)) {
            response.status(200).send({
              message: 'signed in!',
              token: jwt.sign(user.username, process.env.JWT_SECRET,
                {expiresInMinutes: TWO_WEEKS_IN_MINUTES})
            });
            next();
          } else {
            helpers.errorHandler('invalid password', request, response, next);
          }
        } else {
          helpers.errorHandler('invalid username', request, response, next);
        }
      })
      .catch(function(error) {
        helpers.errorLogger(error, request, response, next);
        helpers.errorHandler(error, request, response, next);
      });
  },

  signup: function(request, response, next) {
    var newUser = request.body.username;
    var password = request.body.password;
    if (!newUser || !password) {
      helpers.errorHandler('Invalid username/password input', request, response, next);
    }
    User.model.findOneAsync({username: newUser})
      .then(function(user) {
        //enable the following log statement for troubleshooting purposes
        //console.debug('findOneAsync args:', arguments);
        if (user) {
          helpers.errorHandler('User already exists', request, response, next);
        } else {
          User.createHash(password, function(error, hash) {
            User.model.createAsync({
              username: newUser,
              password: hash
            })
            .then(function(user) {
              response.status(201).send({
                token: jwt.sign(user.username, process.env.JWT_SECRET,
                  {expiresInMinutes: TWO_WEEKS_IN_MINUTES})
              });
            })
            .catch(function(error) {
              helpers.errorHandler(error, request, response, next);
            });
          });
        }
      })
      .catch(function(error) {
        helpers.errorHandler(error, request, response, next);
      });
  },

  checkAuth: function(request, response, next) {
    //TODO: still need communication from client side to test sent headers (#91)
    //this will be whatever header we put the jwt under.
    var token = request.headers['x-jwt'];
    var user = jwt.verify(token, process.env.JWT_SECRET);
  }
};
