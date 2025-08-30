// tests/product.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../src/api/models/Product');
const app = require('../server');

let mongoServer;

beforeAll(async () => { 
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany();
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

describe('Product API', () => {

  test('Create a product', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A product for testing',
      price: 50,
      currency: 'USD',
      images: [
        'https://picsum.photos/seed/p1/800/600',
        'https://picsum.photos/seed/p2/800/600',
        'https://picsum.photos/seed/p3/800/600',
        'https://picsum.photos/seed/p4/800/600'
      ],
      stock: 10,
    };

    const res = await request(app)
      .post('/api/products')
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Product');
    expect(res.body.data.currency).toBe('USD');
    expect(res.body.data.images.length).toBe(4);
    expect(res.body.data.stock).toBe(10);
  });

  test('Get all products', async () => {
    await Product.create({
      name: 'Prod 1',
      price: 20,
      currency: 'USD',
      images: ['https://picsum.photos/seed/p5/800/600'],
      stock: 5
    });

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Prod 1');
    expect(res.body.data[0].currency).toBe('USD');
    expect(res.body.data[0].stock).toBe(5);
  });

  test('Get single product by ID', async () => {
    const product = await Product.create({
      name: 'Prod Single',
      price: 30,
      currency: 'USD',
      images: ['https://picsum.photos/seed/p6/800/600'],
      stock: 8
    });

    const res = await request(app).get(`/api/products/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Prod Single');
    expect(res.body.data.currency).toBe('USD');
    expect(res.body.data.stock).toBe(8);
  });

  test('Update product', async () => {
    const product = await Product.create({
      name: 'Old Name',
      price: 40,
      currency: 'USD',
      images: ['https://picsum.photos/seed/p7/800/600'],
      stock: 3
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({
        name: 'Updated Name',
        price: 45,
        currency: 'USD',
        images: [
          'https://picsum.photos/seed/p7/800/600',
          'https://picsum.photos/seed/p8/800/600'
        ],
        stock: 5,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.price).toBe(45);
    expect(res.body.data.currency).toBe('USD');
    expect(res.body.data.images.length).toBe(2);
    expect(res.body.data.stock).toBe(5);
  });

  test('Delete product', async () => {
    const product = await Product.create({
      name: 'Delete Me',
      price: 15,
      currency: 'USD',
      images: ['https://picsum.photos/seed/p9/800/600'],
      stock: 2
    });

    const res = await request(app).delete(`/api/products/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Delete Me');

    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });

  test('Get non-existing product', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

});
