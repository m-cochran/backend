const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.json());

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


    // Create an order record in your database
    const order = new Order({
      userId: req.user.id, // The current logged-in user
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentIntent.payment_method,
      amount: paymentIntent.amount_received,
      paymentStatus: paymentIntent.status,
      shippingAddress: req.body.shippingAddress, // Collect shipping address from frontend
      // Add more details here
    });

    await order.save();

    // Respond with order information
    res.json({ success: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
