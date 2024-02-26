const ApiError = require("../error/ApiError");
const bcrypt = require("bcrypt");
const { User, Basket, BasketProduct, Order } = require("../models/models");
const jwt = require("jsonwebtoken");

const generateJwt = (id, email, name, surname, phone) => {
  return jwt.sign({ id, email, name, surname, phone }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async getUser(req, res) {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    res.json({ user });
  }

  async registration(req, res, next) {
    const { email, password, surname, name, phone, login } = req.body;
    let errors = [];
    if (!email) {
      errors.push("email");
    }
    if (!password) {
      errors.push("пароль");
    }
    if (!name) {
      errors.push("имя");
    }
    if (!phone) {
      errors.push("номер телефона");
    }
    if (!surname) {
      errors.push("фамилия");
    }
    if (!login) {
      errors.push("логин");
    }

    if (errors.length) {
      return next(
        ApiError.forbiddenError("Следующие поля пусты: " + errors.join(", ")),
      );
    }

    const candidate_login = await User.findOne({ where: { login } });
    if (candidate_login) {
      return next(
        ApiError.forbiddenError("Пользователь с таким логином уже существует"),
      );
    }

    const candidate_email = await User.findOne({ where: { email } });
    if (candidate_email) {
      return next(
        ApiError.forbiddenError("Пользователь с такой почтой уже существует"),
      );
    }

    const candidate_phone = await User.findOne({ where: { phone } });
    if (candidate_phone) {
      return next(
        ApiError.forbiddenError(
          "Пользователь с таким номером телефона уже существует",
        ),
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({
      email,
      password: hashPassword,
      phone,
      name,
      surname,
    });
    await Basket.create({ userId: user.id });
    const token = generateJwt(
      user.id,
      user.email,
      user.name,
      user.surname,
      user.phone,
    );
    return res.json({ token });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email) {
      return next(ApiError.badRequest("Пустой адрес электронной почты"));
    }
    if (!password) {
      return next(ApiError.badRequest("Пустой пароль"));
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.badRequest("Пользователь с таким email не найден"));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.badRequest("Неверный пароль"));
    }
    const token = generateJwt(
      user.id,
      user.email,
      user.name,
      user.surname,
      user.phone,
    );
    return res.json({ token });
  }

  async getBasket(req, res, next) {
    try {
      const basket = await Basket.findOne({ where: { userId: req.user.id } });
      if (!basket) {
        return next(ApiError.badRequest("Корзина не найдена"));
      }
      const basketProducts = await BasketProduct.findAll({
        where: { basketId: basket.id, hidden: false },
        include: { all: true },
      });
      if (!basketProducts.length) {
        return res.json({ message: "Корзина пуста" });
      }
      res.json({ basketProducts });
    } catch (error) {
      return next(ApiError.badRequest(error.message));
    }
  }

  async addToBasket(req, res) {
    const { productId, quantity, quantityForce } = req.body;
    const basket = await Basket.findOne({ where: { userId: req.user.id } });
    const basketProductFound = await BasketProduct.findOne({
      where: { productId, basketId: basket.id, hidden: false },
    });
    if (basketProductFound) {
      if (quantityForce) {
        await BasketProduct.update(
          { quantity: quantityForce },
          { where: { productId, hidden: false } },
        );
      } else {
        await BasketProduct.update(
          { quantity: basketProductFound.quantity + (quantity || 1) },
          { where: { productId, hidden: false } },
        );
      }
    } else {
      await BasketProduct.create({
        productId,
        basketId: basket.id,
        quantity: quantity || 1,
      });
    }
    const basketProduct = await BasketProduct.findOne({
      where: { productId, hidden: false },
    });
    res.json({ message: "Товар добавлен в корзину! " });
  }

  async deleteFromBasket(req, res, next) {
    const { productId } = req.body;
    const basket = await Basket.findOne({ where: { userId: req.user.id } });
    const basketProduct = await BasketProduct.findOne({
      where: { productId, basketId: basket.id, hidden: false },
    });
    if (!basketProduct) {
      return next(ApiError.badRequest("Товар не найден"));
    }
    await BasketProduct.update(
      { hidden: true },
      { where: { productId, hidden: false } },
    );
    res.json({ message: "Товар удален из корзины" });
  }

  async createOrder(req, res, next) {
    try {
      const { password, address, payment_method, shipment_method } = req.body;
      if (!password) {
        return next(ApiError.badRequest("Неверный пароль"));
      }
      const basket = await Basket.findOne({ where: { userId: req.user.id } });
      const basketProducts = await BasketProduct.findAll({
        where: { basketId: basket.id, hidden: false },
        include: { all: true },
      });
      let total_price =
        basketProducts[0].product.price * basketProducts[0].quantity;
      if (basketProducts.length > 1) {
        total_price = basketProducts.reduce((curr, prev) => {
          return curr.product.price + prev.product.price;
        });
      }
      await BasketProduct.update(
        { hidden: true },
        { where: { basketId: basket.id, hidden: false } },
      );
      const order = await Order.create({
        userId: req.user.id,
        basketId: basket.id,
        status: "Оформлен",
        date: new Date(),
        address,
        payment_method,
        shipment_method,
        total_price,
      });

      res.json({ message: "Заказ успешно оформлен", order });
    } catch (error) {
      next(ApiError.badRequest(error.message));
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await Order.findAll({ where: { userId: req.user.id } });

      if (!Object.keys(orders).length) {
        return res.json({ message: "Заказов пока нет!" });
      }

      res.json({ orders });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const order = await Order.findOne({ where: { id } });
      if (!order) {
        return next(ApiError.badRequest("Заказ не найден"));
      }

      if (order.userId !== userId) {
        return next(ApiError.forbiddenError("Это не ваш заказ!"));
      }

      await Order.update({ deleted: true }, { where: { id } });
      res.json({ message: "Заказ успешно удален!" });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async auth(req, res) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
}

module.exports = new UserController();
