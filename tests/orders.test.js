const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');

jest.mock('../models/Order');

beforeEach(() => {
  Order.create.mockReset();
  Order.find.mockReset();
  Order.findById.mockReset();
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

describe('GET /api/orders', () => {
  it('returns list of orders', async () => {
    Order.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ id: '1' }])
    });
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: '1' }]);
    expect(Order.find).toHaveBeenCalled();
  });
});

describe('GET /api/orders/:id', () => {
  it('returns an order by id', async () => {
    Order.findById.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });

  it('returns 404 when not found', async () => {
    Order.findById.mockResolvedValue(null);
    const res = await request(app).get('/api/orders/999');
    expect(res.status).toBe(404);
  });
});
