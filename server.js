require('dotenv').config();
const express = require('express');
const paymentRoutes = require('./src/api/routes/paymentRoute');
const productRoutes = require('./src/api/routes/productRoute');
const orderRoutes = require('./src/api/routes/orderRoute');
const connectDB = require('./src/config/db');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
}));


// Routes
app.use('/api', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Only connect to DB & start server if not testing
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));
}

module.exports = app;
