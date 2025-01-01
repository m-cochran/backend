const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch'); // Install this package for HTTP requests
const app = express();

app.use(bodyParser.json());

const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';
const JSONBIN_API_KEY = 'YOUR_API_KEY'; // Get this from your JSONBin account

// Helper function to get all orders
const getOrders = async () => {
  const response = await fetch(JSONBIN_URL, {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY,
    },
  });
  const data = await response.json();
  return data.record;
};

// Helper function to update orders
const updateOrders = async (newOrders) => {
  await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
    },
    body: JSON.stringify(newOrders),
  });
};

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, email, phone, name, address, shippingAddress, cartItems } = req.body;

  try {
    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        email,
        phone,
        name,
        address: JSON.stringify(address),
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems),
      },
    });

    // Get existing orders
    const orders = await getOrders();

    // Add new order
    const newOrder = {
      id: paymentIntent.id,
      userId: email,
      amount: paymentIntent.amount,
      paymentStatus: paymentIntent.status,
      cartItems,
      shippingAddress,
      billingAddress: address,
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);

    // Update orders in JSONBin
    await updateOrders(orders);

    // Respond with success
    res.json({ success: true, orderId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
