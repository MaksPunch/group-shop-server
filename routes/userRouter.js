const Router = require('express');
const userController = require('../controllers/userController');
const userRouter = new Router();

userRouter.get('/:id', userController.getUser);
userRouter.post('/register', userController.registration);

module.exports = userRouter