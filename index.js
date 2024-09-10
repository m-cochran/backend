const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// API Endpoint (Example: Stripe Payment Intent)
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  // Simulated payment processing logic
  try {
    const clientSecret = "example-client-secret"; // Use real logic here
