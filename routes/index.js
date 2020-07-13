const express = require("express");
const routes = express.Router();

const proveRoutes = require('./proveRoutes');


routes
    .use('/proveAssignments', proveRoutes)
    .get('/', (req, res, next) => {
        // This is the primary index, always handled last. 
        res.render('pages/index', {title: 'Welcome to Kitchen Assistent', path: '/'});
       })
    .use((req, res, next) => {
        // 404 page
        res.render('pages/404', {title: '404 - Page Not Found', path: req.url})
      })
    .use((error, req, res, next) => {
        // 500 page
        res.render('pages/500', {title: '500 - Some Error Happened', path: req.url})
      });

module.exports = routes;