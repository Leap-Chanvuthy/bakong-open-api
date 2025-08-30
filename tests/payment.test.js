// tests/payment.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Order = require('../src/api/models/Payment');
const axios = require('axios');

jest.mock('axios');

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear orders before each test
  await Order.deleteMany();
});

  afterEach(() => {
    const currentTest = expect.getState().currentTestName;
    const testErrors = expect.getState().currentTestErrors;

    if (!testErrors || testErrors.length === 0) {
      console.log(`✔️ ${currentTest}`);
    } else {
      console.log(`❌ ${currentTest}`);
    }
  });


describe('Payment API', () => {
  test('Generate KHQR', async () => {
    const res = await request(app).post('/api/generate-khqr').send();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.qr).toBeDefined();
    expect(res.body.data.md5).toBeDefined();
    expect(res.body.data.orderId).toMatch(/ORDER_\d{5}/);
    expect(res.body.data.expiresAt).toBeDefined(); // now passes
  });

  test('Get Order Info', async () => {
    const newOrder = new Order({
      orderId: 'ORDER_00001',
      qr: 'testqr',
      md5: 'testmd5',
      expiration: Date.now() + 300000,
      paid: false,
      amount: 100,
      currency: 'KHR',
    });
    await newOrder.save();

    const res = await request(app).get(`/api/order/${newOrder.orderId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.orderId).toBe('ORDER_00001');
    expect(res.body.md5).toBe('testmd5');
  });

  test('Check Payment Success', async () => {
    const order = new Order({
      orderId: 'ORDER_00002',
      qr: 'fakeqr',
      md5: 'fakemd5',
      expiration: Date.now() + 300000,
      paid: false,
      amount: 100,
      currency: 'KHR',
    });
    await order.save();

    axios.post.mockResolvedValueOnce({
      data: {
        responseCode: 0,
        data: {
          hash: 'bakonghash123',
          fromAccountId: 'from123',
          toAccountId: 'to123',
          currency: 'KHR',
          amount: 100,
        },
      },
    });

    const res = await request(app)
      .post('/api/check-payment')
      .send({ md5: 'fakemd5' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Payment confirmed');

    const updatedOrder = await Order.findOne({ orderId: 'ORDER_00002' });
    expect(updatedOrder.paid).toBe(true);
    expect(updatedOrder.bakongHash).toBe('bakonghash123');
  });

  test('Check Payment Not Found', async () => {
    const res = await request(app)
      .post('/api/check-payment')
      .send({ md5: 'notexistmd5' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Order not found');
  });
});
