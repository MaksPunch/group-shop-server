const ApiError = require("../error/ApiError");
const { Brand } = require("../models/models");

class BrandController {
  async getAll(req, res) {
    const brands = await Brand.findAll();
    return res.json({ brands });
  }

  async addBrand(req, res, next) {
    try {
      let { name } = req.body;
      const brand = await Brand.create({
        name,
      });

      return res.json({ brand });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async deleteBrand(req, res, next) {
    try {
      const { id } = req.params;
      const brand = await Brand.findOne({ where: { id } });
      if (!brand) {
        return next(ApiError.badRequest("Бренд не найден"));
      }
      await Brand.destroy({ where: { id } });
      return res.json({ brand });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async updateBrand(req, res, next) {
    try {
      const { id, name } = req.body;
      const brand = await Brand.findOne({ where: { id } });

      if (!brand) {
        next(ApiError.badRequest("Бренд не найден"));
      }

      const newProduct = await Brand.update({ name }, { where: { id } });
      return res.json({ newProduct });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new BrandController();
