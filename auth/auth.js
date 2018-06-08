const User = require('../models/User');
const Login = require('../models/Login');
const express = require('express');
const jwt = require('jsonwebtoken');
const configSecret = require('../config/secret');
const router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/register', function(req, res, next) {
  User.findOne({ 'email' :  req.body.email }, (err, user) => {
    // Internall error
    if (err) res.status(500).send({message: 'Something went wrong! Sorry!'});

    // If user exists
    if (user) {
      return res.status(409).send({message: 'That email is already taken'})
    }
    
    // Create a new user 
    const newUser = new User();

    // set the user's credentials
    newUser.email = req.body.email;      
    newUser.password = req.body.password;

    // save the user
    newUser.save();

    const payload = {
      email: req.body.email
    };

    const token = jwt.sign(payload, configSecret.secret, {
      expiresIn: '24h'
    });

    return res.status(201).send({
      message: 'Registered and logged in',
      email: req.body.email,
      token: token
    })
  });
});

router.post('/login', function(req, res, next) {
  User.findOne({ 'email' :  req.body.email }, (err, user) => {
    // Internall error
    if (err) res.status(500).send({message: 'Something went wrong! Sorry!'});

    if (!user) {
      return res.status(400).send({message: 'I cannot find the user'});
    } 
  
    // if (!Login.canAuthenticate(req.body.email)) {
    //   return res.status(500).send({message: 'Cannot authenticate. Wait 1 minute'});
    // }
    
    if (!user.validPassword(req.body.password)) {
      // Login.failedLoginAttempt(req.body.email); 
      return res.status(400).send({message: 'Wrong password'});
    }  

    const payload = {
      email: req.body.email
    };

    const token = jwt.sign(payload, configSecret.secret, {
      expiresIn: '24h'
    });

    // Login.successfulLoginAttempt(req.body.email);

    return res.status(201).send({
      message: 'Logged in!',
      email: req.body.email,
      token: token
    });
    }
  );
});

router.post('/verify', function(req, res, next) {
  const verifiedToken = jwt.verify(req.body.token, configSecret.secret);
  res.send({
    email: verifiedToken.email
  });
});

module.exports = router;
