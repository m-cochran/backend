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
    const { amount, email, cartItems, return_url } = req.body; // Extract the amount, email, cart items, and return URL

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
      // Create a PaymentIntent with the amount, email, and metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert dollars to cents
        currency: 'usd',
        metadata: {
          email: email,
          cartItems: JSON.stringify(cartItems), // Store cart items as a JSON string
        },
        confirm: true, // Automatically confirm the payment
        return_url: return_url || 'https://m-cochran.github.io/Randomerr/thank-you/', // Use the provided return_url or a default one
      });

      // Respond with the client secret and the receipt URL (if applicable)
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
      });
    } catch (error) {
      // Handle any errors that occur during PaymentIntent creation
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any method that is not POST or OPTIONS
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
