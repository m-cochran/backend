const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

// Initialize Express
const app = express();

// Enable CORS with specific settings
app.use(cors({
  origin: 'https://m-cochran.github.io/Randomerr/', // Replace with the actual frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Google Sheets API setup
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const { client_email, private_key } = credentials;
const auth = new google.auth.JWT(
  client_email,
  null,
  private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1wPeCV9lwDu-gJarBLTHAOipb4y83RwT_Een88zHGcpc'; // Your Google Sheets ID


// Endpoint to create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, email, items } = req.body;

    // Input validation
    if (!amount || !email || !items) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      receipt_email: email,
      payment_method_types: ['card'],
    });

    // Store purchase details in Google Sheets
    const orderId = paymentIntent.id; // Stripe order ID
    const total = amount;
    const date = new Date().toISOString(); // Get current date/time
    const itemsJSON = JSON.stringify(items); // Convert items to string for storage

    // Append data to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E', // Adjust the range if needed
      valueInputOption: 'RAW',
      resource: {
        values: [[orderId, email, itemsJSON, total, date]],
      },
    });

    // Respond with the client secret for Stripe payment
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Payment failed. Try again later.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
