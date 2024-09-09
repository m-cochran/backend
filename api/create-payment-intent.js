const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your frontend (GitHub Pages)
  res.setHeader('Access-Control-Allow-Origin', 'https://m-cochran.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

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
    // Create a PaymentIntent with the specified amount and currency (USD)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert dollars to cents for Stripe
      currency: 'usd',
      metadata: {
        email: email,
        cartItems: JSON.stringify(cartItems), // Store cart items as a JSON string in metadata
      },
    });

    // Respond with the client secret key that the frontend will use to confirm the payment
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
