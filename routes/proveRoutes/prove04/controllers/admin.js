const Product = require('../models/product');
const { validationResult } =  require("express-validator/check");

const RECIPES_PER_PAGE = 3;


exports.getAddProduct = (req, res, next) => {
  res.render('pages/prove/prove04/admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: null,
    hasError: false,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.user);
  const name = req.body.name;
  const imageUrl = req.body.imageUrl;
  const instruction = req.body.instruction;
  const ingredients = req.body.ingredent;
  const time = req.body.time;


  const errors = validationResult(req);
    if (!errors.isEmpty()){
      console.log(errors.array())
      return res.status(422).render('pages/prove/prove04/admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMessage: errors.array()[0].msg,
        product: {name: name, instruction: instruction, time: time, userId: req.user},
        hasError: true,
        validationErrors: errors.array()
      });
    }

  const product = new Product ({name: name, imageUrl: imageUrl, instruction: instruction, totalTime: time, ingredent: ingredients, userId: req.user});
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('pages/prove/prove04');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('pages/prove/prove04/admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedName = req.body.name;
  const updatedTime = req.body.time;
  const updatedImageUrl = req.body.imageUrl;
  const updatedInstruc = req.body.instruction;
  const updatedIngredents = req.body.ingredent;

  const errors = validationResult(req);
    if (!errors.isEmpty()){
      console.log(errors.array())
      return res.status(422).render('pages/prove/prove04/admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: true,
        errorMessage: errors.array()[0].msg,
        product: {name: updatedName, totalTime: updatedTime, imageUrl: updatedImageUrl, instruction: updatedInstruc, ingredent: updatedIngredents, _id: prodId},
        hasError: true,
        validationErrors: errors.array()
      });
    }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.name = updatedName;
      product.totalTime = updatedTime;
      product.instruction = updatedInstruc;
      product.imageUrl = updatedImageUrl;
      product.ingredent = updatedIngredents;
      return product.save()
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then(numRecipes => {
      totalItems = numRecipes;
      return Product.find()
        .skip((page - 1) * RECIPES_PER_PAGE)
        .limit(RECIPES_PER_PAGE);
    })
    .then(products => {
      res.render('pages/prove/prove04/admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: RECIPES_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / RECIPES_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
      }
      if (!product) {
        return next(new Error('Product not found.'));
      }
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postDeleteProduct = (req, res, next) => {
//   Product.findById(req.body.productId)
//     .then((product) =>{
//       if (product.userId.toString() !== req.user._id.toString()) {
//         return res.redirect('/');
//       }
//     });
//   const prodId = req.body.productId;
//   Product.findByIdAndRemove(prodId)
//     .then(() => {
//       console.log('DESTROYED PRODUCT');
//       res.redirect('products');
//     })
//     .catch(err => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };
