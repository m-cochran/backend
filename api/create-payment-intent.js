const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
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

    // Prepare data to save into a JSON file
    const paymentData = {
      amount,
      email,
      phone,
      name,
      address,
      shippingAddress,
      cartItems,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      createdAt: new Date().toISOString()
    };

    // Specify the file path
    const filePath = path.join(__dirname, 'payments.json');

    // Check if the file exists and read it
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath);
      existingData = JSON.parse(rawData);
    }

    // Append the new payment data to existing data
    existingData.push(paymentData);

    // Write the updated data to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    // Respond to the client
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
