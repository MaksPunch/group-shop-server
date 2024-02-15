const Router = require("express");
const categoryRouter = new Router();
const categoryController = require("../controllers/categoryController");

categoryRouter.delete("/:id", categoryController.delete);
categoryRouter.get("/", categoryController.getAll);
categoryRouter.post("/", categoryController.add);
categoryRouter.put("/", categoryController.update);

module.exports = categoryRouter;
