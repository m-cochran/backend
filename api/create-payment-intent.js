const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://m-cochran.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the preflight request (OPTIONS method)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST requests
  if (req.method === 'POST') {
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
      // Create a PaymentIntent with the amount, email, metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert dollars to cents
        currency: 'usd',
        metadata: {
          email: email,
          cartItems: JSON.stringify(cartItems), // Store cart items as a JSON string
        },
      });

      // Respond with the client secret
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
