const Router = require('express');
const userRouter = require('./userRouter');
const router = new Router();

router.use('/user', userRouter)
// router.use('/product', productRouter)

module.exports = router 