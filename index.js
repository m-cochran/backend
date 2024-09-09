const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// Allow cross-origin requests from your frontend
app.use(cors({
  origin: 'https://m-cochran.github.io', // Your frontend URL
  methods: ['GET', 'POST'], // Allow GET and POST requests
  allowedHeaders: ['Content-Type'], // Allow Content-Type header
}));

// Middleware to parse incoming requests
app.use(express.json());

// Handle the payment intent creation route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, cartItems } = req.body;

  if (!amount || !email || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    // Create a PaymentIntent with the specified amount and metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to cents
      currency: 'usd',
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems),
      },
    });

    // Send back the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server on the port assigned by Vercel
module.exports = app;
