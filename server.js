const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { body, validationResult } = require('express-validator');
const Order = require('./models/Order');

const app = express();
const logger = pino({ transport: { target: 'pino-pretty' } });
const httpLogger = pinoHttp({ logger });

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(httpLogger);

// Serve marketing website
app.use('/', express.static(path.join(__dirname, 'public/website')));
// Serve web app
app.use('/app', express.static(path.join(__dirname, 'public/app')));

const BASE_PRICES = { 2: 70, 3: 104, 5: 184, 7: 250 };
const DELIVERY_FEE = 45;

app.post('/api/orders', [
  body('name').isString().notEmpty(),
  body('pickupAddress').isString().notEmpty(),
  body('dropoffAddress').isString().notEmpty(),
  body('cylinderSize').isInt().custom(value => [2,3,5,7].includes(Number(value))),
  body('quantity').isInt({ min: 1 }),
  body('returnTime').isISO8601(),
  body('paymentType').isIn(['subscription','pay-per-refill'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, pickupAddress, dropoffAddress, cylinderSize, quantity, returnTime, paymentType } = req.body;
    let price = BASE_PRICES[cylinderSize] * quantity + DELIVERY_FEE;
    if (paymentType === 'subscription') {
      price *= 0.9;
    }
    const order = await Order.create({
      name,
      pickupAddress,
      dropoffAddress,
      cylinderSize,
      quantity,
      returnTime,
      paymentType,
      price
    });
    return res.status(201).json({ id: order.id, price: order.price });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/basagas';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    app.listen(PORT, () => {
      logger.info(`BasaGas server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
