const path = require('path');

const express = require('express');
const isAuth = require("../middleware/is-auth");
const { check } =  require("express-validator/check");

const adminController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, 
    [
        check('name', 'Please enter a valid name.')
            .isLength({min: 3})
            .trim(),
        check('time', 'Please enter a valid time')
            .isLength({min: 3}),
        check('instruction', 'Please enter a valid instruction.')
            .isLength({min: 8})
            .trim()
    ], 
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth,
    [
        check('name', 'Please enter a valid name.')
            .isLength({min: 3})
            .trim(),
        check('time', 'Please enter a valid time')
            .isLength({min: 3}),
        check('instruction', 'Please enter a valid instruction.')
            .isLength({min: 8})
            .trim()
    ],   
    adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
