const sequelize = require('../db')
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING, unique: true},
    login: {type: DataTypes.STRING}
})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const BasketProduct = sequelize.define('basket_product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
    hidden: {type: DataTypes.BOOLEAN, defaultValue: false }
})

const Product = sequelize.define('product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false, unique: true},
    price: {type: DataTypes.INTEGER, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
})

const ProductInfo = sequelize.define('product_info', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
})

const Order = sequelize.define('order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    total_price: {type: DataTypes.INTEGER, allowNull: false},
    order_date: {type: DataTypes.DATE},
    payment_method: {type: DataTypes.STRING},
    shipment_method: {type: DataTypes.STRING},
    address: {type: DataTypes.STRING},
})

const OrderProduct = sequelize.define('order_product', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: DataTypes.INTEGER, allowNull: false}
})

User.hasOne(Basket);
Basket.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

Basket.hasMany(BasketProduct);
BasketProduct.belongsTo(Basket);

Product.hasMany(BasketProduct);
BasketProduct.belongsTo(Product)

Product.hasMany(ProductInfo, {as: "info"})
ProductInfo.belongsTo(Product)

Order.hasMany(OrderProduct);
OrderProduct.belongsTo(Order);

OrderProduct.hasOne(Product);
Product.belongsTo(Order);


module.exports = {
    User,
    Basket,
    BasketProduct,
    Product,
    ProductInfo,
    Order,
    OrderProduct
}