const Router = require('express');
const userController = require('../controllers/userController');
const AuthCheckMiddleware = require('../middlewares/AuthCheckMiddleware');
const userRouter = new Router();

userRouter.get('/basket', AuthCheckMiddleware, userController.getBasket);
userRouter.post('/basket', AuthCheckMiddleware, userController.addToBasket);
userRouter.delete('/basket', AuthCheckMiddleware, userController.deleteFromBasket);
userRouter.get('/auth', AuthCheckMiddleware, userController.auth);
userRouter.get('/orders', AuthCheckMiddleware, userController.getOrders)
userRouter.post('/order', AuthCheckMiddleware, userController.createOrder);
userRouter.delete('/order/:id', AuthCheckMiddleware, userController.deleteOrder);
userRouter.post('/register', userController.registration);
userRouter.post('/login', userController.login);
userRouter.get('/:id', userController.getUser);

module.exports = userRouter