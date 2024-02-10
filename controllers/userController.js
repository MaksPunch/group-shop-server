const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const { User, Basket, BasketProduct} = require("../models/models");
const jwt = require('jsonwebtoken');

const generateJwt = (id, email, name, surname, phone) => {
    return jwt.sign(
        {id, email, name, surname, phone},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async getUser(req, res) {
        const {id} = req.params
        const user = await User.findOne({where: {id}});
        res.json({user})
    }

    async registration(req, res, next) {
        const {email, password, surname, name, phone, login} = req.body
        let errors = [];
        if (!email) {
            errors.push('email')
        }
        if (!password) {
            errors.push('пароль')
        }
        if (!name) {
            errors.push('имя')
        }
        if (!phone) {
            errors.push('номер телефона')
        }
        if (!surname) {
            errors.push('фамилия')
        }
        if (!login) {
            errors.push('логин')
        }

        if (errors.length) {
            return next(ApiError.badRequest('Следующие поля пусты: ' + errors.join(', ')));
        }

        const candidate_login = await User.findOne({where: {login}})
        if (candidate_login) {
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
        }
        
        const candidate_email = await User.findOne({where: {email}})
        if (candidate_email) {
            return next(ApiError.badRequest('Пользователь с такой почтой уже существует'))
        }

        const candidate_phone = await User.findOne({where: {phone}})
        if (candidate_phone) {
            return next(ApiError.badRequest('Пользователь с таким номером телефона уже существует'))
        }

        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({email, password: hashPassword, phone, name, surname})
        await Basket.create({userId: user.id});
        const token = generateJwt(user.id, user.email, user.name, user.surname, user.phone);
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        if (!email) {
            return next(ApiError.badRequest('Пустой адрес электронной почты'))
        }
        if (!password) {
            return next(ApiError.badRequest('Пустой пароль'))
        }
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.badRequest('Пользователь с таким email не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.name, user.surname, user.phone)
        return res.json({token})
    }

    async basket(req, res) {
        const basket = await Basket.findOne({where: {userId: req.user.id}});
        const basketProducts = await BasketProduct.findAll({where: {basketId: basket.id, hidden: false}});
        res.json({basketProducts});
    }

    async addToBasket(req, res) {
        const {productId} = req.body;
        const basket = await Basket.findOne({where: {userId: req.user.id}});
        const basketProductFound = await BasketProduct.findOne({where: {productId, basketId: basket.id, hidden: false}});
        if (basketProductFound) {
            await BasketProduct.update({quantity: basketProductFound.quantity + 1}, {where: {productId, hidden: false}});
        } else {
            await BasketProduct.create({productId, basketId: basket.id, quantity: 1})
        }
        const basketProduct = await BasketProduct.findOne({where: {productId, hidden: false}});
        res.json({basketProduct});
    }

    async deleteFromBasket(req, res, next) {
        const {productId} = req.body;
        const basket = await Basket.findOne({where: {userId: req.user.id}});
        const basketProduct = await BasketProduct.findOne({where: {productId, basketId: basket.id, hidden: false}});
        if (!basketProduct) {
            return next(ApiError.badRequest('Товар не найден'))
        }
        await BasketProduct.update({hidden: true}, {where: {productId, hidden: false}});
        res.json({basketProduct});
    }

    async order(req, res, next) {
        const {password} = req.body;
        if (!password) {
            return next(ApiError.badRequest('Неверный пароль'));
        }
        const basket = await Basket.findOne({where: {userId: req.user.id}});
        await BasketProduct.update({hidden: true}, {where: {basketId: basket.id, hidden: false}});
        res.json({message: "Заказ успешно оформлен"});
    }

    async auth(req, res) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController();