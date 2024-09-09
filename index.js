const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://m-cochran.github.io', // Update this to your actual frontend URL
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
}));

// Default root route
app.get('/', (req, res) => {
  res.send('Welcome to the Stripe Payment Backend!');
});

// Create payment intent route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, cartItems } = req.body;

  // Validate request body
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart items are required' });
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit (cents)
      currency: 'usd',
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
