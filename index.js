const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51PulULDDaepf7cji2kqbdFVOzF37bS8RrtgO8dpVBpT1m8AXZhcyIBAAf42VOcpE8auFxbm1xSjglmBhvaIYaRck00QkUGMkpF'); // Your Stripe secret key
const app = express();

// Middleware
app.use(cors({
  origin: 'https://m-cochran.github.io', // Allow requests from your GitHub Pages site
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Create Payment Intent Route
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, receipt_email } = req.body;

  // Validate the amount
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      receipt_email: receipt_email, // Receipt email to send the receipt after successful payment
      automatic_payment_methods: {
        enabled: true, // Enable automatic payment methods (supports different payment methods)
      },
    });

    // Respond with the client secret (for frontend to complete payment)
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
