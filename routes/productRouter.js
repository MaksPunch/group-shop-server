const Router = require("express");
const productRouter = new Router();
const productController = require("../controllers/productController");

productRouter.get("/:id", productController.getProduct);
productRouter.delete("/:id", productController.deleteProduct);
productRouter.get("/", productController.getAll);
productRouter.post("/", productController.addProduct);
productRouter.put("/:id", productController.updateProduct);

module.exports = productRouter;
