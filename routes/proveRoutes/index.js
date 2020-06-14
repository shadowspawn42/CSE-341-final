const express = require("express");
const routes = express.Router();



const prove04 = require('./prove04'); 
// const prove05 = require('./prove05'); 



routes
    .use('/prove04', prove04);


module.exports = routes;