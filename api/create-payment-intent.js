const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cors = require('cors');


app.use(express.json());

// Allow CORS from specific origins
app.use(
  cors({
    origin: 'https://m-cochran.github.io', // Replace with your frontend origin
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.options('*', cors()); // Enable preflight for all routes

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, cartItems } = req.body;

  // Validate the amount
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Validate email
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Validate cart items
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  try {
    // Create a PaymentIntent with the provided amount and metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert dollars to cents
      currency: 'usd',
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems), // Store cart items as a JSON string
      },
    });

    // Send back the client secret to confirm the payment on the client-side
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
