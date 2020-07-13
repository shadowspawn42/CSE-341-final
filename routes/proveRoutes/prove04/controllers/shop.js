const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');
const { db } = require('../models/product');

const RECIPES_PER_PAGE = 3;

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
      res.render('pages/prove/prove04/shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
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

exports.getSearch = (req, res, next) => {
  const searchIngred = req.query.ingredient;

  console.log(searchIngred);

  const regex = new RegExp(escapeRegex(req.query.ingredient), 'gi');

  console.log(regex);

  const page = +req.query.page || 1;
  let totalItems;
  Product.find({ingredent: regex})
  .countDocuments()
    .then(numRecipes => {
      totalItems = numRecipes;
      console.log(totalItems);
      return Product.find({ingredent: regex})
        .skip((page - 1) * 6)
        .limit(6);
    })
    .then(products => {
      res.render('pages/prove/prove04/shop/search', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: 6 * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / 6)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  // Product.findAll({ where: { id: prodId } })
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findById(prodId)
    .then(product => {
      res.render('pages/prove/prove04/shop/product-detail', {
        product: product,
        pageTitle: product.name,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
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
      res.render('pages/prove/prove04/shop/index', {
        prods: products,
        pageTitle: 'Recipes',
        path: '/prove04',
        currentPage: page,
        hasNextPage: RECIPES_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / RECIPES_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
          res.render('pages/prove/prove04/shop/cart', {
            path: '/cart',
            pageTitle: 'Your Favorites',
            products: products,
            isAuthenticated: req.session.isLoggedIn
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    console.log(result);
    res.redirect('cart');
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
  .populate("cart.items.productId")
  .execPopulate()
  .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, product: {...i.productId._doc}};
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id})
    .then(orders => {
      res.render('pages/prove/prove04/shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};