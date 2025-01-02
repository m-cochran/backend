const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

// Load Google Sheets credentials
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));
const { client_email, private_key } = credentials;

// Authenticate with Google Sheets API
const auth = new google.auth.JWT(
  client_email,
  null,
  private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1wPeCV9lwDu-gJarBLTHAOipb4y83RwT_Een88zHGcpc'; // Your Google Sheets ID

// Route to create a payment intent (Stripe)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, email } = req.body;

    // Input validation
    if (!amount || !email) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      receipt_email: email,
      payment_method_types: ['card']
    });

    // Respond with the client secret
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Payment failed. Try again later.' });
  }
});

// Route to store purchase details in Google Sheets
app.post('/api/store-purchase', async (req, res) => {
  const { orderId, email, items, total, date } = req.body;

  try {
    // Validate input data
    if (!orderId || !email || !items || !total || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Append data to Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E', // Replace "Sheet1" with your sheet name and range
      valueInputOption: 'RAW',
      resource: {
        values: [[orderId, email, JSON.stringify(items), total, date]], // Save items as a JSON string
      },
    });

    res.status(200).json({ message: 'Purchase stored successfully' });
  } catch (err) {
    console.error('Error storing purchase:', err);
    res.status(500).json({ message: 'Error storing purchase' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
