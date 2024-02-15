const ApiError = require("../error/ApiError");
const { Category } = require("../models/models");

class CategoryController {
  async getAll(req, res) {
    const categories = await Category.findAll();
    return res.json({ categories });
  }

  async add(req, res, next) {
    try {
      let { name } = req.body;
      const category = await Category.create({
        name,
      });

      return res.json({ category });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ where: { id } });
      if (!category) {
        return next(ApiError.badRequest("Бренд не найден"));
      }
      await Category.destroy({ where: { id } });
      return res.json({ category });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async update(req, res, next) {
    try {
      const { id, name } = req.body;
      const category = await Category.findOne({ where: { id } });

      if (!category) {
        next(ApiError.badRequest("Бренд не найден"));
      }

      const newCategory = await Category.update({ name }, { where: { id } });
      return res.json({ newCategory });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new CategoryController();
