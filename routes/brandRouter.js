const Router = require("express");
const brandRouter = new Router();
const brandController = require("../controllers/brandController");

brandRouter.delete("/:id", brandController.deleteBrand);
brandRouter.get("/", brandController.getAll);
brandRouter.post("/", brandController.addBrand);
brandRouter.put("/", brandController.updateBrand);

module.exports = brandRouter;
