const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const app = express();

app.use(bodyParser.json());

// File path for storing orders
const ORDERS_FILE = './orders.json';

// Ensure orders file exists
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

app.post('/api/create-payment-intent', async (req, res) => {
  const {
    amount,
    email,
    phone,
    name,
    address,
    shippingAddress,
    cartItems // Receive cartItems from the request
  } = req.body;

  try {
    // Create a payment intent with metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        email: email,
        phone: phone,
        name: name,
        address: JSON.stringify(address),
        shippingAddress: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems) // Add cartItems to metadata
      }
    });

    // Read existing orders
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));

    // Create a new order object
    const newOrder = {
      id: paymentIntent.id,
      userId: email, // Use email as a unique identifier for the user
      amount: paymentIntent.amount,
      paymentStatus: paymentIntent.status,
      cartItems: cartItems,
      shippingAddress: shippingAddress,
      billingAddress: address,
      createdAt: new Date().toISOString(),
    };

    // Add the new order to the orders array
    ordersData.push(newOrder);

    // Save updated orders back to the file
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));

    // Respond with success and order ID
    res.json({ success: true, orderId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
