const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (Optional, if still using other env variables)
dotenv.config();

// Initialize Express app
const app = express();
console.log(process.env.JWT_SECRET); // This should print the value from .env

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authroutes');
app.use('/api/auth', authRoutes);

// Prediction routes from your existing API
// app.use('/api', predictionRoutes);

// Connect to MongoDB directly with the connection string
const mongodbUri = 'mongodb+srv://syedmuhammadmoizzaidi:Ronaldo7@fruitquality.hpbyilq.mongodb.net/myDatabase'; // Replace 'yourdbname' with your actual database name

mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
