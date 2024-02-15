const Router = require("express");
const userRouter = require("./userRouter");
const productRouter = require("./productRouter");
const { Product } = require("../models/models");
const brandRouter = require("./brandRouter");
const categoryRouter = require("./categoryRouter");
const router = new Router();

router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/brand", brandRouter);
router.use("/category", categoryRouter);
router.get("/catalog", async (req, res) => {
  const products = await Product.findAll();
  res.json({ products });
});

module.exports = router;
