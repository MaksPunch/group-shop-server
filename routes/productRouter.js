const Router = require('express');
const productRouter = new Router();
const productController = require('../controllers/productController');

productRouter.get('/:id', productController.getProduct);
productRouter.get('/', productController.getAll);
productRouter.post('/', productController.addProduct);

module.exports = productRouter