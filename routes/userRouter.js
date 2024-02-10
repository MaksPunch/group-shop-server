const Router = require('express');
const userController = require('../controllers/userController');
const AuthCheckMiddleware = require('../middlewares/AuthCheckMiddleware');
const userRouter = new Router();

userRouter.get('/basket', AuthCheckMiddleware, userController.basket);
userRouter.post('/basket', AuthCheckMiddleware, userController.addToBasket);
userRouter.delete('/basket', AuthCheckMiddleware, userController.deleteFromBasket);
userRouter.get('/auth', AuthCheckMiddleware, userController.auth);
userRouter.post('/order', AuthCheckMiddleware, userController.order);
userRouter.post('/register', userController.registration);
userRouter.post('/login', userController.login);
userRouter.get('/:id', userController.getUser);

module.exports = userRouter