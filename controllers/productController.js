const ApiError = require("../error/ApiError");
const { User, Basket, Product, ProductInfo} = require("../models/models");
const {resolve} = require("node:path");
const uuid = require("uuid");

class ProductController {
    async getProduct(req, res) {
        const {id} = req.params
        const product = await Product.findOne({where: {id}, include: [{model: ProductInfo, as: 'info'}]})
        res.json({product})
    }

    async getAll(req, res) {
        const products = await Product.findAll();
        res.json({products})
    }

    async addProduct(req, res, next) {
        try {
            let {name, price, description, info} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            await img.mv(resolve(__dirname, '..', 'static', fileName));
            const product = await Product.create({name, price, description, img: fileName});

            if (info) {
                info = JSON.parse(info)
                info.forEach(i =>
                    ProductInfo.create({
                        title: i.title,
                        description: i.description,
                        productId: product.id
                    })
                )
            }

            return res.json(product)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new ProductController();