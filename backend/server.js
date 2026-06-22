const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const { router: cartRoutes } = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payments');

const nearbyRoutes = require('./routes/nearby');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', nearbyRoutes);

console.log("✅ SQLite database ready");

app.get('/', (req, res) => {
  res.send('Food Delivery API running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
