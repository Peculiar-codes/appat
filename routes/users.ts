var express = require('express');
const router = express.Router()
import {
  Request,
  Response,
  NextFunction
} from "express"

import {
  USERS
} from "../interfaces/USER"
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const {
  ensureAuth,
  ensureGuest
} = require('../Middlewares/auth');

// Login Page
router.get('/login', ensureGuest, (req: Request, res: Response) => res.render('login',{
  title:"login",
  email:"",
  password:""
}));

// Register Page
router.get('/register', ensureGuest, (req: Request, res: Response) => res.render('register',{
  title:"Register",
  email:"",
  password:"",
  password2:"",
  displayName:"",
  firstName:"",
  lastName:""
}))
// Register
router.post('/register', (req: any, res: Response) => {
  const {
   firstName,lastName,displayName, email, password, password2
  } = req.body;
  let errors: any[] = [];

  if (!firstName || !email || !password || !password2 ||  lastName || displayName ) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters'
    });
  }

  if (errors.length > 0) {
    res.render('register', {
      title:"Register",
      errors,
      firstName,
      lastName,
      displayName,
      email,
      password,
      password2,
      
    });
  } else {
    User.findOne({
      email: email
    }).then(user => {
      if (user) {
        errors.push({
          msg: 'Email already exists'
        });
        res.render('register', {
          title:"Register",
      errors,
      firstName,
      lastName,
      displayName,
      email,
      password,
      password2,
      
        });
      } else {
        const newUser = new User({
      firstName,
      lastName,
      displayName,
      email,
      password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
            .save()
            .then(user => {
              req?.flash(
                'success_msg',
                'You are now registered and can log in'
              );
              res.redirect('/users/login');
            })
            .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req: any, res: Response) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;