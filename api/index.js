const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  res.send(`Payment intent created for amount: ${amount}`);
});

module.exports = app;
