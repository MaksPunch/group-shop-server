const ApiError = require("../error/ApiError");
const { User, Basket, Product, ProductInfo } = require("../models/models");
const { resolve } = require("node:path");
const uuid = require("uuid");

class ProductController {
  async getProduct(req, res) {
    const { id } = req.params;
    const product = await Product.findOne({
      where: { id, deleted: false },
      include: [{ model: ProductInfo, as: "info" }],
    });
    res.json({ product });
  }

  async getAll(req, res) {
    let {brandId, typeId, limit, page} = req.query;
    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit
    let products;
    if (!brandId && !typeId) {
      products = await Product.findAndCountAll({limit, offset})
    }
    if (brandId && !typeId) {
      products = await Product.findAndCountAll({where: {brandId}, limit, offset})
    }
    if (!brandId && typeId) {
      products = await Product.findAndCountAll({where: {typeId}, limit, offset})
    }
    if (brandId && typeId) {
      products = await Product.findAndCountAll({where: {brandId, typeId}, limit, offset})
    }

    return res.json({ products });
  }

  async addProduct(req, res, next) {
    try {
      let { name, price, description, info, brandId, categoryId } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + ".jpg";
      await img.mv(resolve(__dirname, "..", "static", fileName));
      const product = await Product.create({
        name,
        price,
        description,
        img: fileName,
        brandId,
        categoryId,
      });

      if (info) {
        info = JSON.parse(info);
        info.forEach((i) =>
          ProductInfo.create({
            title: i.title,
            description: i.description,
            productId: product.id,
          }),
        );
      }

      return res.json({ product });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ where: { id } });
      if (!product) {
        return next(ApiError.badRequest("Товар не найден"));
      }
      await Product.update({ deleted: true }, { where: { id } });
      return res.json({ product });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id, name, description, price, categoryId, brandId } = req.body;
      const { img } = req.files;
      let fileName = uuid.v4() + ".jpg";
      await img.mv(resolve(__dirname, "..", "static", fileName));
      const product = await Product.findOne({ where: { id, deleted: false } });

      if (!product) {
        next(ApiError.badRequest("Продукт не найден"));
      }

      const newProduct = await Product.update(
        { name, description, price, img: fileName, categoryId, brandId },
        { where: { id } },
      );
      return res.json({ old: product, new: newProduct });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ProductController();
