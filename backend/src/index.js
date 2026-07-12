const express = require('express');
const cors = require('cors');

require('./config/database');

const authRoutes = require('./routes/auth');
const subscriberRoutes = require('./routes/subscribers');
const publicRoutes = require('./routes/public');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Protected admin routes
app.use('/api/subscribers', authMiddleware, subscriberRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentalKu Company API running' });
});

app.listen(PORT, () => {
  console.log(`🚀 RentalKu Company API running on http://localhost:${PORT}`);
});
