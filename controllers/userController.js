const ApiError = require("../error/ApiError");
const bcrypt = require('bcrypt');
const { User, Basket } = require("../models/models");
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
        res.json('Пользователь ' + id)
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
        const basket = await Basket.create({userId: user.id})
        const token = generateJwt(user.id, user.email, user.name, user.surname, user.phone)
        return res.json({token})
    }
}

module.exports = new UserController();