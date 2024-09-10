const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Sample API route
app.post('/api/create-payment-intent', (req, res) => {
  const { amount } = req.body;
  // Payment logic would go here
  res.json({ success: true, clientSecret: "example-client-secret" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
