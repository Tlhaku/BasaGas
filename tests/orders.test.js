const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');

jest.mock('../models/Order');

beforeEach(() => {
  Order.create.mockReset();
});

describe('POST /api/orders', () => {
  it('creates an order with price', async () => {
    Order.create.mockResolvedValue({ id: '1', price: 80 });
    const res = await request(app)
      .post('/api/orders')
      .send({
        name: 'Tester',
        pickupAddress: 'A St',
        dropoffAddress: 'B St',
        cylinderSize: 2,
        quantity: 1,
        returnTime: new Date().toISOString(),
        paymentType: 'subscription'
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('1');
    expect(Order.create).toHaveBeenCalled();
  });

  it('rejects invalid cylinder size', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        name: 'Tester',
        pickupAddress: 'A St',
        dropoffAddress: 'B St',
        cylinderSize: 9,
        quantity: 1,
        returnTime: new Date().toISOString(),
        paymentType: 'subscription'
      });
    expect(res.status).toBe(400);
  });
});
