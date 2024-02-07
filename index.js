require('dotenv').config()
const express = require('express');
const cors = require('cors');
const sequelize = require('./db')
const app = express();
const port = 3000;
const path = require('path');
const router = require('./routes/index');
const ErrorHandlingMiddleware = require('./middlewares/ErrorHandlingMiddleware');

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.send(")")
})

app.use('/api', router);

app.use(ErrorHandlingMiddleware);

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(port, () => console.log('started at', port))
    } catch (e) {
        console.log(e)
    }
}

start()