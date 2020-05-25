const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  res.render('pages/prove/prove04/auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  res.render('pages/prove/prove04/auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
  User.findOne({email: email})
    .then(user => {
        if(!user){
          req.flash("error", "Invalid email or Password");
          return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
            .then(doMatch => {
                if(doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        req.flash("error", "Invalid email or Password");
                        res.redirect('/proveAssignments/prove04');
                    });
                }
                res.redirect("login");
            })
            .catch(err => {
                console.log(err);
                res.redirect("login");
            });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confrimPassword = req.body.confrimPassword;
    User.findOne({email: email})
        .then(userDoc => {
            if(userDoc){
                return res.redirect('signup');
            } 
            return bcrypt.hash(password, 12)
                .then(hashPassword => {
                    const user = new User({
                        email: email,
                        password: hashPassword,
                        cart: { items: []}
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('login')
                })
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/proveAssignments/prove04');
  });
};
